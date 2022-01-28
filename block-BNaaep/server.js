let http = require('http');
let url = require('url');
let fs = require('fs');
let qs = require('querystring');
let userPath = __dirname + '/contacts/';
let server = http.createServer(handleServer);

function handleServer(req, res) {
  let store = '';
  let parsedUrl = url.parse(req.url).pathname;
  let parsedUserName = url.parse(req.url, true).query.username;
  let contentType = req.headers['content-type'];

  let imgPath = url.parse(req.url, true).pathname.split('/');

  req.on('data', (chunk) => {
    store = store + chunk;
  });

  req.on('end', () => {
    if (req.method === 'GET' && parsedUrl === '/') {
      fs.readFile(__dirname + '/assets/index.html', (err, content) => {
        if (err) console.log(err);
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.end(content);
      });
    } else if (req.method === 'GET' && parsedUrl === '/index.css') {
      fs.readFile(__dirname + '/assets/index.css', (err, content) => {
        res.writeHead(200, { 'Content-type': 'text/css' });
        res.end(content);
      });
    } else if (
      imgPath[imgPath.length - 1].endsWith('jpeg') ||
      imgPath[imgPath.length - 1].endsWith('png')
    ) {
      fs.readFile(
        __dirname + '/assets/' + imgPath[imgPath.length - 1],
        (err, content) => {
          if (err) console.log(err);
          if (imgPath[imgPath.length - 1].startsWith('img')) {
            res.writeHead(200, { 'Content-type': 'image/jpeg' });
          }
          if (imgPath[imgPath.length - 1].startsWith('png')) {
            res.writeHead(200, { 'Content-type': 'image/png' });
          }
          res.end(content);
        }
      );
    } else if (req.method === 'GET' && parsedUrl === '/assets/about.css') {
      fs.readFile(__dirname + '/assets/about.css', (err, content) => {
        if (err) console.log(err);
        res.writeHead(200, { 'Content-type': 'text/css' });
        res.end(content);
      });
    } else if (req.method === 'GET' && parsedUrl === '/about') {
      return fs.createReadStream(__dirname + '/assets/about.html').pipe(res);
    } else if (req.method === 'GET' && parsedUrl === '/contact') {
      return fs.createReadStream('./form.html').pipe(res);
    } else if (req.method === 'POST' && parsedUrl === '/form') {
      let user;
      if (contentType === 'application/x-www-form-urlencoded') {
        user = qs.parse(store);
      } else if (contentType === 'application/json') {
        user = JSON.parse(store);
      }
      if (
        user.username === '' ||
        user.name === '' ||
        user.email === '' ||
        user.bio === '' ||
        user.age === ''
      )
        return res.end('Every Colomn should be filled');

      fs.open(userPath + user.username + '.json', 'wx', (err, fd) => {
        if (err) {
          return res.end(`${user.username} is already exist`);
        }
        fs.writeFile(fd, JSON.stringify(user), (err) => {
          if (err) res.end(err);
          fs.close(fd, () => {
            return res.end(`${user.username} is created`);
          });
        });
      });
    } else if (req.method === 'GET' && parsedUrl === '/user') {
      fs.readFile(userPath + parsedUserName + '.json', (err, user) => {
        if (err) console.log(err);
        let userData = JSON.parse(user.toString());
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.write(`<h1>Name: ${userData.name}</h1>`);
        res.write(`<h2>email: ${userData.email}</h2>`);
        res.write(`<h2>UserName: ${userData.username}</h2>`);
        res.write(`<h2>Age: ${userData.age}</h2>`);
        res.write(`<h2>Bio: ${userData.bio}</h2>`);
        res.end();
      });
    } else if (req.method === 'GET' && parsedUrl === '/users/all') {
      fs.readdir(userPath, (err, files) => {
        let fileLength = files.length - 1;
        if (err) res.end(`File could not load: ${err}`);
        files.forEach((file, index) => {
          fs.readFile(userPath + file, (err, user) => {
            if (err) return res.end(err);
            let data = JSON.parse(user.toString());
            res.write(`<h1>Name: ${data.name}</h1>`);
            res.write(`<h2>Email: ${data.email}</h2>`);
            res.write(`<h2>UserName: ${data.username}</h2>`);
            res.write(`<h2>Age: ${data.age}</h2>`);
            res.write(`<h2>Bio: ${data.bio}</h2>`);
            if (fileLength === index) {
              res.end();
            }
          });
        });
      });
    } else {
      res.writeHead(404, { 'Content-type': 'text/html' });
      res.end('<h1>Page Not Found</h1>');
    }
  });
}
server.listen(5001);
