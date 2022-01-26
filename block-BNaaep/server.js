let http = require("http");
let url = require("url");
let fs = require("fs");
let qs = require("querystring");
let userPath = __dirname + "/contacts/"
let server = http.createServer(handleServer);

function handleServer(req,res){

    let store= "";
    let parsedUrl = url.parse(req.url).pathname;
    let parsedUserName = url.parse(req.url, true).query.username;
    let contentType = req.headers["content-type"]

    req.on("data", (chunk)=>{
        store = store + chunk;
    })

    req.on("end", ()=>{
        if(req.method === "GET" && parsedUrl === "/"){
            return fs.createReadStream(__dirname+"/assets/index.png").pipe(res);
        }
        else if(req.method === "GET" && parsedUrl === "/about"){
            return fs.createReadStream(__dirname+"/assets/about.png").pipe(res);
        }
        else if(req.method === "GET" && parsedUrl === "/contact"){
            return fs.createReadStream("./form.html").pipe(res);
        }
        else if(req.method === "POST" && parsedUrl === "/form"){
            let userName;
            if(contentType === 'application/x-www-form-urlencoded'){
                userName = qs.parse(store).username;
            } else if(contentType === "application/json"){
                userName = JSON.parse(store).username;
            }
            fs.open( userPath + userName + ".json", "wx", (err, fd)=>{
                if(err){
                    return res.end(`${userName} is already exist`)
                }
                fs.writeFile(fd, (store), (err)=>{
                    if(err)res.end(err);
                    fs.close(fd,()=>{
                        return res.end(`${userName} is created`)
                    })
                })
            })
        }
        else if(req.method === "GET" && parsedUrl === "/users"){
            return fs.createReadStream(userPath+parsedUserName+".json").pipe(res);
            // fs.readFile(userPath+parsedUserName+".json",(err,user)=>{
            //     if(err)console.log(err);
            //     let userData = qs.parse(user.toString());
            //     console.log(userData);
            //     res.writeHead(200, {"Content-type": "type/html"});
            //     res.write(`<h1>Name: ${userData.name}</h1>`);
            //     res.write(`<h2>email: ${userData.email}</h2>`);
            //     res.write(`<h2>UserName: ${userData.username}</h2>`);
            //     res.write(`<h2>Age: ${userData.age}</h2>`);
            //     res.write(`<h2>Bio: ${userData.bio}</h2>`);
            //     res.end();
            // });
        } 
        else if(req.method === "GET" && parsedUrl === "/users/all"){
            fs. readdir(userPath, (err,files)=>{
                if(err)res.end(`File could not load: ${err}`);
                    res.end(JSON.stringify(files));
            })
        }
        else {
            res.writeHead(404, {"Content-type": "type/html"});
            res.end("<h1>Page Not Found</h1>");
        }
    })
}
server.listen(5001);