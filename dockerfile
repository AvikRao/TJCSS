FROM node:14.15.1
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN sudo apt-get install openjdk-8-jre-headless
RUN sudo apt install openjdk-8-jdk-headless

CMD ["npm", "start"]