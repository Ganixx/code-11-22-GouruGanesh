import fs from "fs";

const totalcount = {
  Underweight: 0,
  NormalWeight: 0,
  OverWeight: 0,
  ModeratelyObese: 0,
  SeverlyObese: 0,
  VerySeverlyObese: 0,
};

const bmiCategoty = {
  U: "Underweight",
  N: "Normal Weight",
  O: "Over Weight",
  M: "Moderately obese",
  S: "Severly obese",
  V: "Very Severly obese",
};

const healthRisk = {
  M: "Malnutrition Risk",
  L: "Low Risk",
  E: "Enhanced Risk",
  R: "Medium Risk",
  H: "High Risk",
  V: "Very High Risk",
};

function appender(data, intial = false) {
  if (!intial) data += ",";
  fs.appendFile("ou.json", data, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

fs.stat("in.json", (errStat, stats) => {
  fs.open("in.json", "r", (err, fd) => {
    appender("[", true);
    getData(stats.size, err, fd, 1);
  });
});

async function getData(size, err, fd, pos, string = "", prev = "") {
  if (err || pos > size) {
    let temp = await JSON.stringify(totalcount);
    appender(temp);
    appender("]", true);
    return;
  }
  fs.read(
    fd,
    Buffer.alloc(1),
    0,
    1,
    pos,
    function postRead(errRead, bytesRead, buffer) {
      let temp = buffer.toString("utf8");
      if (temp === "[" || temp === "]") {
        getData(size, err, fd, pos + 1, temp);
      } else if (temp === "," && prev === "}") {
        bussinessLogicUtil(JSON.parse(string));
        string = "";
        getData(size, err, fd, pos + 1, string, temp);
      } else {
        string += temp;
        getData(size, err, fd, pos + 1, string, temp);
      }
    }
  );
}

function bussinessLogicUtil(data) {
  let tempBmiCat;
  let tempHeaRisk;
  let bmi;
  let { HeightCm, WeightKg } = data;
  bmi = WeightKg / (HeightCm / 100) ** 2;
  if (bmi <= 18.4) {
    tempBmiCat = bmiCategoty.U;
    tempHeaRisk = healthRisk.M;
    totalcount.Underweight += 1;
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    tempBmiCat = bmiCategoty.N;
    tempHeaRisk = healthRisk.L;
    totalcount.NormalWeight += 1;
  } else if (bmi >= 25 && bmi <= 29.9) {
    tempBmiCat = bmiCategoty.O;
    tempHeaRisk = healthRisk.E;
    totalcount.OverWeight += 1;
  } else if (bmi >= 30 && bmi <= 34.9) {
    tempBmiCat = bmiCategoty.M;
    tempHeaRisk = healthRisk.R;
    totalcount.ModeratelyObese += 1;
  } else if (bmi >= 35 && bmi <= 39.9) {
    tempBmiCat = bmiCategoty.S;
    tempHeaRisk = healthRisk.H;
    totalcount.SeverlyObese += 1;
  } else if (bmi > 40) {
    tempBmiCat = bmiCategoty.V;
    tempHeaRisk = healthRisk.V;
    totalcount.VerySeverlyObese += 1;
  }
  appender(
    JSON.stringify({ category: tempBmiCat, Bmi: bmi, Healthrisk: tempHeaRisk })
  );
}
