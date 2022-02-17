// import package express
const express = require("express");

// Import package bcrypt
const bcrypt = require("bcrypt");

// import package express-flash and express-session
const flash = require("express-flash");
const session = require("express-session");

// menggunakan package express
const app = express();

// use express-flash
app.use(flash());

// setup session midleware
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue",
  })
);

// import package pg
const db = require("./connection/db");

// set template engine
app.set("view engine", "hbs");

// set app can use spesific folder (public)
app.use("/public", express.static(__dirname + "/public"));

// render data from form to home
app.use(express.urlencoded({ extended: false }));

const projects = [
  {
    title: "DUMBWAYS MOBILE APP",
    startDate: "2022-02-01",
    endDate: "2022-03-01",
    year: "2022",
    duration: "3 Months",
    description: `Some quick example text to build on the card title and make up the bulk of the card's contents.`,
  },
];

let month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
let isLogin = true;

// set endpoint / root
app.get("/", function (req, res) {
  res.send("Hello world");
});

// home
app.get("/home", function (req, res) {
  let query = "SELECT * FROM tb_projects ORDER BY id DESC";

  db.connect((err, client, done) => {
    if (err) throw err;

    client.query(query, (err, result) => {
      done();

      if (err) throw err;

      let data = result.rows;

      data = data.map((item) => {
        return {
          ...item,
          duration: getDurationTime(
            new Date(item.end_date) - new Date(item.start_date)
          ),
          year: getYear(new Date(item.start_date)),
          isLogin: req.session.isLogin,
        };
      });
      res.render("index", {
        isLogin: req.session.isLogin,
        user: req.session.user,
        projects: data,
      });
    });
  });
});

app.post("/home", function (req, res) {
  let { projectName, startDate, endDate, description, image } = req.body;

  let project = {
    projectName,
    startDate,
    endDate,
    description,
    image: "image.png",
  };

  db.connect((err, client, done) => {
    if (err) throw err;

    let query = `INSERT INTO tb_projects(name, start_date, end_date, description, image) VALUES
                        ('${project.projectName}', '${project.startDate}', '${project.endDate}', '${project.description}', '${project.image}')`;

    client.query(query, (err, result) => {
      done();
      if (err) throw err;
      res.redirect("/home");
    });
  });
});

// set update project
app.get("/update-project/:id", function (req, res) {
  let { id } = req.params;

  db.connect((err, client, done) => {
    if (err) throw err;

    let query = `SELECT * FROM tb_projects WHERE id=${id}`;

    client.query(query, (err, result) => {
      done();

      if (err) throw err;

      let data = result.rows;

      data = data.map((item) => {
        return {
          ...item,
          startDate: convertDate(item.start_date),
          endDate: convertDate(item.end_date),
        };
      });
      data = data[0];
      console.log(data);
      res.render("update-project", { project: data });
    });
  });
});

// update project
app.post("/update-project/:id", function (req, res) {
  let { id } = req.params;
  let { projectName, startDate, endDate, description } = req.body;

  let query = `UPDATE tb_projects SET name='${projectName}', start_date='${startDate}', end_date='${endDate}', description='${description}' WHERE id=${id}`;

  db.connect((err, client, done) => {
    if (err) throw err;

    client.query(query, (err, result) => {
      done();
      if (err) throw err;

      res.redirect("/home");
    });
  });
});

// delete fitur
app.get("/delete-project/:id", function (req, res) {
  let { id } = req.params;

  db.connect((err, client, done) => {
    if (err) throw err;

    let query = `DELETE FROM tb_projects WHERE id=${id}`;

    client.query(query, (err, result) => {
      done();
      if (err) throw err;

      res.redirect("/home");
    });
  });
});

// add project
app.get("/my-project", function (req, res) {
  res.render("my-project");
});

// detail projek
app.get("/home/:id", function (req, res) {
  let { id } = req.params;

  db.connect((err, client, done) => {
    if (err) throw err;

    let query = `SELECT * FROM tb_projects WHERE id=${id}`;
    client.query(query, (err, result) => {
      done();
      if (err) throw err;

      let data = result.rows;
      data = data.map((item) => {
        return {
          ...item,
          startDate: getFullTime(item.start_date),
          endDate: getFullTime(item.end_date),
          duration: getDurationTime(item.end_date - item.start_date),
          isLogin: isLogin,
        };
      });
      data = data[0];
      res.render("my-project-detail", { project: data });
    });
  });
});

// contact
app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  let { email, password } = req.body;

  db.connect((err, client, done) => {
    if (err) throw err;

    let query = `SELECT * FROM tb_user WHERE email='${email}'`;
    client.query(query, (err, result) => {
      done();

      if (result.rows.length == 0) {
        req.flash("danger", "Account not found !");
        return res.redirect("/login");
      }

      let isMatch = bcrypt.compareSync(password, result.rows[0].password);

      if (isMatch) {
        req.session.isLogin = true;
        req.session.user = {
          id: result.rows[0].id,
          email: result.rows[0].email,
          name: result.rows[0].name,
        };
        req.flash("success", "Login Success");
        res.redirect("/home");
      } else {
        req.flash("failed", "Password doesnt match");
        res.redirect("/login");
      }
    });
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  let { name, email, password } = req.body;

  let hashPassword = bcrypt.hashSync(password, 10);

  db.connect((err, client, done) => {
    if (err) throw err;

    let query = `INSERT INTO tb_user(name, email, password) VALUES
                        ('${name}','${email}','${hashPassword}')`;

    client.query(query, (err, resul) => {
      done();
      if (err) throw err;

      req.flash("success", "Account succesfully registered");
      res.redirect("/login");
    });
  });
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/home");
});

// konfig app port
const port = 5000;
app.listen(port, function () {
  console.log(`application running on port ${port}`);
});

function getDurationTime(duration) {
  const miliseconds = 1000;
  const secondsInMinutes = 60;
  const minutesInHours = 60;
  const secondsInHours = secondsInMinutes * minutesInHours;
  const hoursInDay = 24;

  let timeDuration = new Date(duration);

  let dayDuration = timeDuration / (miliseconds * secondsInHours * hoursInDay);

  if (dayDuration >= 30) {
    return Math.floor(dayDuration / 30) + " Months";
  } else {
    return Math.floor(dayDuration) + " Days";
  }
}

function getYear(first) {
  let year = new Date(first).getFullYear();
  return `${year}`;
}

function getFullTime(time) {
  let date = time.getDate();
  let monthIndex = time.getMonth();
  let year = time.getFullYear();

  let hours = time.getHours();
  let minutes = time.getMinutes();

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return `${date} ${month[monthIndex]} ${year}`;
}

function convertDate(time) {
  let date = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();

  if (date < 10) {
    date = "0" + date;
  }

  if (month < 10) {
    month = "0" + month;
  }

  return `${year}-${month}-${date}`;
}
