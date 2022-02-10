// import package express
const express = require("express");

// menggunakan package express
const app = express();

// set template engine
app.set("view engine", "hbs");

// sett app can use spesific folder (public)
app.use("/public", express.static(__dirname + "/public"));

// render data from form to blog
app.use(express.urlencoded({ extended: false }));

// set login
let isLogin = true;

const projects = [
  {
    title: "DUMBWAYS MOBILE APP",
    year: "2021",
    duration: "Durasi: 3 bulan",
    message: `Some quick example text to build on the card title and make up the bulk of the card's content.`,
  },
];

// set endpoint / root
app.get("/", function (req, res) {
  res.send("Hello world");
});

// home
app.get("/home", function (req, res) {
  let dataProjects = projects.map(function (item) {
    return {
      ...item,
      isLogin: isLogin,
    };
  });
  res.render("index", { isLogin: isLogin, projects: dataProjects });
});

app.post("/home", function (req, res) {
  let title = req.body.projectname;

  let starDate = req.body.startdate;
  let endDate = req.body.enddate;

  let duration = new Date(endDate) - new Date(starDate);
  let startYearS = new Date(starDate);

  let message = req.body.message;

  // let iconGroup = req.body.tech;

  //   let file = req.body.file;

  let project = {
    title,
    year: getYear(startYearS),
    duration: getDurationTime(duration),
    message,
  };

  projects.push(project);

  console.log(projects);
  res.redirect("/home");
});

// delete fitur
app.get("/delete-project/:index", function (req, res) {
  let index = req.params.index;

  projects.splice(index, 1);
  res.redirect("/home");
});

// detail projek
app.get("/my-project", function (req, res) {
  res.render("my-project");
});

app.get("/home/:id", function (req, res) {
  let id = req.params.id;

  res.render("my-project-detail", { id: id });
});

// contact
app.get("/contact", function (req, res) {
  res.render("contact");
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
