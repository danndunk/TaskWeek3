// import package express
const express = require("express");

// menggunakan package express
const app = express();

// set template engine
app.set("view engine", "hbs");

// sett app can use spesific folder (public)
app.use("/public", express.static(__dirname + "/public"));

// render data from form to home
app.use(express.urlencoded({ extended: false }));

// set login
let isLogin = true;

const projects = [
  {
    title: "DUMBWAYS MOBILE APP",
    startDate: "2022-02-01",
    endDate: "2022-03-01",
    year: "2022",
    duration: "3 Months",
    description: `Some quick example text to build card.`,
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

  let startDate = req.body.startdate;
  let endDate = req.body.enddate;

  let duration = new Date(endDate) - new Date(startDate);
  let startYearS = new Date(startDate);

  let description = req.body.description;
  let iconGroup = req.body.tech;

  //   let file = req.body.file;

  let project = {
    title,
    startDate,
    endDate,
    year: getYear(startYearS),
    duration: getDurationTime(duration),
    description,
    iconGroup,
  };

  projects.push(project);

  res.redirect("/home");
});

// set update project
app.get("/update-project/:index", function (req, res) {
  let index = req.params.index;
  index = projects[index];
  res.render("update-project", index);
});

// update project
// app.post("/home", function (req, res) {
//   let index = req.params.index;

//   projects[index].title = req.body.projectname;
//   projects[index].startDate = req.body.startdate;
//   projects[index].endDate = req.body.enddate;

//   projects[index].duration = new Date(endDate) - new Date(startDate);
//   projects[index].year = new Date(startDate);

//   projects[index].description = req.body.description;

//   // let index = req.params.index;

//   // let title = req.body.projectname;

//   // let startDate = req.body.startdate;
//   // let endDate = req.body.enddate;

//   // let duration = new Date(endDate) - new Date(startDate);
//   // let startYearS = new Date(startDate);

//   // let description = req.body.description;

//   // let project = {
//   //   title,
//   //   startDate,
//   //   endDate,
//   //   year: getYear(startYearS),
//   //   duration: getDurationTime(duration),
//   //   description,
//   // };

//   // delete projects[index];
//   // projects[index] = project;
//   console.log("asidhasud");
//   res.redirect("/home");
// });

// delete fitur
app.get("/delete-project/:index", function (req, res) {
  let index = req.params.index;

  projects.splice(index, 1);
  res.redirect("/home");
});

// add project
app.get("/my-project", function (req, res) {
  res.render("my-project");
});

// detail projek
app.get("/home/:index", function (req, res) {
  let index = req.params.index;
  index = projects[index];
  index.startDate = getFullTime(new Date(index.startDate));
  index.endDate = getFullTime(new Date(index.endDate));

  res.render("my-project-detail", index);
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
