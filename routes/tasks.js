const EventEmitter = require("events");
const async = require('async')
const spawn = require("child_process");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const path = require('path');

function deleteFile(dir, file) {
    return new Promise(function (resolve, reject) {
        var filePath = path.join(dir, file);
        fs.lstat(filePath, function (err, stats) {
            if (err) {
                return reject(err);
            }
            if (stats.isDirectory()) {
                resolve(deleteDirectory(filePath));
            } else {
                fs.unlink(filePath, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    });
};
function deleteDirectory(dir) {
    return new Promise(function (resolve, reject) {
        fs.access(dir, function (err) {
            if (err) {
                return reject(err);
            }
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return reject(err);
                }
                Promise.all(files.map(function (file) {
                    return deleteFile(dir, file);
                })).then(function () {
                    fs.rmdir(dir, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }).catch(reject);
            });
        });
    });
};

// Global variables, set as necessary
const CONCURRENCY = 5; //queue
const TIMEOUT = 60; //runfile
const SCRIPT_DIR = "localspace/"; //io
const processEmitter = new EventEmitter(); //runfile

const db = require('./db');
const { fetchFile } = require("./process");


// Queue workhorse block
var queue = async.queue(async function (obj, callback) {
    try {

        let output = await runFile(obj.io, obj.filename, obj.directory, obj.args ?? [], obj.process_id, obj.client_id); // runs the file and gets the output
        //TODO DB QUERY HERE stores output for future retrieval if necessary


    } catch (e) {
        obj.io.to(obj.client_id).emit('error', 'Something happened while attempting to run the file.');
        console.log(e);
        await deleteDirectory(obj.directory);
        callback();
        return;
    }


    let file = fs.readFileSync(path.join(obj.directory, obj.filename));

    let prevSub = await db.query('SELECT * FROM submissions WHERE labid=%s AND student=%s;', obj.labid, obj.student);
    if (prevSub.rowCount != 0) {
        await db.query('INSERT INTO submissions (student, file, ts, output, attemptno, labid) VALUES (%s, %L, %s, %L, 1, %s);'
            , obj.student, file, Date.now(), output, obj.labid);

    }

    //cleanunp after we're done

    await deleteDirectory(obj.directory);

    callback();
}, CONCURRENCY); // how many processes to allow in parallel


async function timeout(process_id) {
    return new Promise((resolve) => {
        let wait = setTimeout(() => {
            clearTimeout(wait);
            resolve("timeout");
        }, TIMEOUT * 1000);
    });
}

async function success(process_id) {
    return new Promise((resolve) => {
        processEmitter.once(process_id, () => {
            resolve("success");
        })
    });
}

/**
 * @param {} io the io socket
 * @param {String} filename name of file to be run
 * @param {String} directory extension
 * @param {Array} args args to pass to the run command
 * @param {String} process_id uuid
 * @param {String} client_id uuid 
 */
async function runPython(io, filename, directory, args, process_id, client_id) {

    let str = ''

    // Runs file in python 3.8 with option u (NECESSARY in order to retrieve stdout)
    let pythonProcess = spawn.spawn('python3.8', ['-u', filename].concat(args), { cwd: directory });

    // reports any output to the client, adds to output string
    pythonProcess.stdout.on('data', (data) => {
        str += data.toString();
        io.to(client_id).emit('output', data.toString());
    });

    // reports any errors to the client, adds to output string
    pythonProcess.stderr.on('data', (data) => {
        str += data.toString();
        io.to(client_id).emit('error', data.toString());
    });

    // tells the emitter to emit this process_id once the file has finished running
    pythonProcess.on('close', (code) => {
        processEmitter.emit(process_id);
    });

    // Wait for either successful execution or a timeout
    let exitStatus = await Promise.race([timeout(process_id), success(process_id)]);

    // If successful, tell the client that this process ended without server errors (THERE COULD BE EXECUTION ERRORS, but unimportant)
    if (exitStatus == "success") {
        console.log(`Process ${process_id} completed successfully.`);
        io.to(client_id).emit("success", `Process ${process_id} complete.\n`);

        // If timed out, tell the client that it timed out
    } else if (exitStatus == "timeout") {
        console.log(`Process ${process_id} timed out.`);
        io.to(client_id).emit("timeout", `Process ${process_id} timed out.\n`);
    }

    // kill the process to save memory and return the output
    pythonProcess.kill();
    return str;
}



/**
 * @param {} io the io socket
 * @param {String} filename name of file to be run
 * @param {String} directory extension
 * @param {Array} args args to pass to the run command
 * @param {String} process_id uuid
 * @param {String} client_id uuid 
 */
async function runJava(io, filename, directory, args, process_id, client_id) {

    let str = ''

    // Check for compilation errors
    let compileErrors = false;

    // Compile the .java file
    let javaCompile = spawn.spawn('javac', [filename], { cwd: directory });

    // Report any compilation output to client, add to output string (this is a formality, I don't think Java has any output when compiling)
    javaCompile.stdout.on('data', (data) => {
        str += data.toString();
        io.to(client_id).emit('output', data.toString());
    });

    // Report any compilation errors to client, add to output string, set compileErrors to true
    javaCompile.stderr.on('data', (data) => {
        compileErrors = true;
        str += data.toString();
        io.to(client_id).emit('error', data.toString());
    });

    // Tell emitter to emit this process_id once done compiling
    javaCompile.on('close', (code) => {
        processEmitter.emit(process_id);
    });

    // Wait for successful compilation process or timeout, then kill the process to save memory
    let exitStatus = await Promise.race([timeout(process_id), success(process_id)]);
    javaCompile.kill();

    // If there were no compilation errors, run the .class file
    if (!compileErrors) {

        // Run the .class file, remember that java uses the format "java filename" and not "java filename.class" for executing bytecode
        let javaProcess = spawn.spawn('java', [filename.match(/(.+)\.java$/)[1]], { cwd: directory });

        // reports any output to the client, adds to output string
        javaProcess.stdout.on('data', (data) => {
            str += data.toString();
            io.to(client_id).emit('output', data.toString());
        });

        // reports any errors to the client, adds to output string
        javaProcess.stderr.on('data', (data) => {
            str += data.toString();
            io.to(client_id).emit('error', data.toString());
        });

        // tells the emitter to emit this process_id once the file has finished running
        javaProcess.on('close', (code) => {
            processEmitter.emit(process_id);
        });

        // Wait for either successful execution or a timeout, then kill the process to save memory
        exitStatus = await Promise.race([timeout(process_id), success(process_id)]);
        javaProcess.kill();
    }

    // If successful, tell the client that this process ended without server errors (THERE COULD BE COMPILATION/EXECUTION ERRORS, but unimportant)
    if (exitStatus == "success") {
        console.log(`Process ${process_id} completed successfully.`);
        io.to(client_id).emit("success", `Process ${process_id} complete.\n`);

        // If timed out, tell the client that it timed out
    } else if (exitStatus == "timeout") {
        console.log(`Process ${process_id} timed out.`);
        io.to(client_id).emit("timeout", `Process ${process_id} timed out.\n`);
    }

    // return output
    return str;
}

/**
 * @param {} io the io socket
 * @param {String} filename name of file to be run
 * @param {String} directory extension
 * @param {Array} args args to pass to the run command
 * @param {String} process_id uuid
 * @param {String} client_id uuid 
 */
async function runCPP(io, filename, directory, args, process_id, client_id) {

    // Check for compilation errors
    let compileErrors = false;

    // Compile the .cpp file, option o is NECESSARY to avoid getting default "a.out" filename 
    let cppCompile = spawn.spawn('g++', ['-o', `${filename.match(/(.+)\.cpp$/)[1]}.out`, filename], { cwd: directory });

    // Report any compilation output to client, add to output string (this is a formality, I don't think C++ has any output when compiling)
    cppCompile.stdout.on('data', (data) => {
        str += data.toString();
        io.to(client_id).emit('output', data.toString());
    });

    // Report any compilation errors to client, add to output string, set compileErrors to true
    cppCompile.stderr.on('data', (data) => {
        compileErrors = true;
        str += data.toString();
        io.to(client_id).emit('error', data.toString());
    });

    // Tell emitter to emit this process_id once done compiling
    cppCompile.on('close', (code) => {
        processEmitter.emit(process_id);
    });

    // Wait for successful compilation process or timeout, then kill the process to save memory
    let exitStatus = await Promise.race([timeout(process_id), success(process_id)]);
    cppCompile.kill();

    // If there were no compilation errors, run the .out file
    if (!compileErrors) {

        // Run the .class file; unlike Java, C++ DOES use the file extension so "./filename.out" is correct and "./filename" is not
        let cppProcess = spawn.execFile(`./${filename.match(/(.+)\.cpp$/)[1]}.out`, args, { cwd: directory }, (error, stdout, stderr) => {

            // Tells the emitter to emit this process_id once the file has finished running
            processEmitter.emit(process_id);

            // If there was an error in node.js's ability to spawn this process, report it to the client 
            if (error) {
                io.to(client_id).emit('error', error.toString());
            }

            // Report any output and errors to the client, then adds them to the output string
            io.to(client_id).emit('error', stderr.toString());
            io.to(client_id).emit('output', stdout.toString() + '\n');
            str += stdout.toString() + stderr.toString();
        })

        // Wait for either successful execution or a timeout, then kill the process to save memory
        exitStatus = await Promise.race([timeout(process_id), success(process_id)]);
        cppProcess.kill();
    }

    // If successful, tell the client that this process ended without server errors (THERE COULD BE COMPILATION/EXECUTION ERRORS, but unimportant)
    if (exitStatus == "success") {
        console.log(`Process ${process_id} completed successfully.`);
        io.to(client_id).emit("success", `Process ${process_id} complete.\n`);

        // If timed out, tell the client that it timed out
    } else if (exitStatus == "timeout") {
        console.log(`Process ${process_id} timed out.`);
        io.to(client_id).emit("timeout", `Process ${process_id} timed out.\n`);
    }

    // return output
    return str;
}



//TODO MAKE THIS ACCEPT DIFFERENT THINGS!
//TODO SPLIT THIS INTO SMALLER FUNCTIONS 
/**
 * 
 * @param {String} filename name of file to be run
 * @param {String} directory extension
 * @param {Array} args args to pass to the run command
 * @param {String} process_id uuid
 * @param {String} client_id uuid
 */
async function runFile(io, filename, directory, args, process_id, client_id) {
    io.to(client_id).emit("system", `Starting process ${process_id}...\n`); // alert client that queue has reached this process and is starting

    let extension = filename.match(/\..+$/)[0]; // grabs file extension

    if (extension == ".py") {

        return runPython(io, filename, directory, args, process_id, client_id);

    } else if (extension == ".java") {

        return runJava(io, filename, directory, args, process_id, client_id);

    } else if (extension == ".cpp") {
        return runCPP(io, filename, directory, args, process_id, client_id);
    }
}



module.exports = (io) => {


    // When a client connects to the websocket (aka, when someone opens the page in their browser)
    io.on('connection', (socket) => {

        // Log it
        console.log(`Someone has connected to the websocket with id ${socket.id}`);

        // When client submits code

        socket.on('submit', async (data) => {
            let classid = await db.query('SELECT classid FROM labs WHERE id=%s;', data.labid);
            //fetch class id from the lab. if nothing returns, the lab doesnt exist
            if (!classid.rows){
                socket.emit('error', '404: Lab not found. Please return to your dashboard and select the correct class and lab.');
                socket.emit('system', 'File submission terminated.');
                return;
            }
            //if lab exists, determine if student has access to this lab
            let sclasses = await db.query('SELECT class FROM class_user WHERE uid=%s;', data.userid);
            if (!sclasses.rows[0] == classid.rows[0]){
                socket.emit('error','403: No permissions to submit to this lab! Please return to your dashboard and select the correct class and lab.');
                socket.emit('system', 'File submission terminated.');
                return;
            }

            // Create a new, universally unique ID for the process and create a new subdirectory path with this ID to contain it
            let process_id = uuidv4();
            let process_dir = path.join(SCRIPT_DIR, process_id);

            //TODO SECURE THIS!
            // If the uploaded file has data, create the subdirectory and store the file in this subdirectory
            if (data.data != null) {
                fs.mkdirSync(process_dir);
                fs.writeFileSync(path.join(process_dir, data.filename), data.data);

            }
            let f = await fetchFile(11, process_dir);
            // Add the process to the queue
            
            queue.push(
                {
                    io: io,
                    filename: f.name,
                    directory: process_dir,
                    process_id: process_id,
                    client_id: socket.id,
                    args: [data.filename],
                    labid: data.labid,
                    student: data.student
                }
            );
            // TODO static/js/run.js make necessary parameters
            // Report to client that their file has been added to the queue and is waiting to be processed.
            console.log(`Connection ${socket.id} has added process ${process_id} to the queue.`);
            socket.emit("system", `Process ${process_id} has been created and added to the queue at position ${queue.length()}\n`);
        });


    });
    console.log('Socket/IO server started on port 5050')

}