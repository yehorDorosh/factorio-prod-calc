const item = class {
  constructor(name, prodTime, numOutItems, materials, type = 'item') {
    this.name = name;
    this.prodTime = prodTime;
    this.numOutItems = numOutItems;
    this.materials =  materials;
    this.type = type;
  }
  prodMult(factoryLevel = 1, ovenMult = 1, meltingMult = 1, rawOilMult = 1) {
    let multiplicator;
    switch (this.type) {
      case 'item':
        multiplicator = factoryProduction[factoryLevel];
        break;
      case 'ore':
        multiplicator = ovenMult;
        break;
      case 'melting':
        multiplicator = meltingMult;
        break;
      case 'raw oil':
        multiplicator = rawOilMult;
        break;
      default:
        multiplicator = 1;
        break;
    }
    return multiplicator;
  }
  getItemsPerSec(factoryNumbers = {
    1: 1,
    2: 0,
    3: 0
  }) {
    let productivity = 0;
    for (let level in factoryNumbers) {
      productivity += factoryNumbers[level] * this.prodMult(level);
    }
    return (1 / this.prodTime) * productivity;
  }
  getMaterialPerSec(factoryNumbers) {
    let itemsPerSec = this.getItemsPerSec(factoryNumbers);
    let materialsPerSec = {};
    for (let material in this.materials) {
      let currentMaterialPerSec = this.materials[material] * itemsPerSec;
      materialsPerSec[material] = currentMaterialPerSec;
      //console.log(`${this.name} - ${itemsPerSec}/sec, Need: ${itemsLib[material].name} - ${currentMaterialPerSec}/sec`);
    }
    return materialsPerSec;
  }
  getFactoryNumbers(itemsPerSec = 1, factorysLevel = 1) {
    let factoryNumbers = {
      1: 0,
      2: 0,
      3: 0
    }
    let factorysNum = (itemsPerSec * this.prodTime) / this.prodMult(factorysLevel);
    factoryNumbers[factorysLevel] = Number(factorysNum.toFixed(2));
    // console.log(`${this.name} - ${itemsPerSec}/sec, Need: factorys ${factorysNum.toFixed(1)}/${Math.ceil(factorysNum)}`);
    return factoryNumbers;
  }
  calcTechLine(itemsPerSec, factorysLevel) {
    let factoryNumbers = this.getFactoryNumbers(itemsPerSec, factorysLevel);
    allFactorys[this.name] = allFactorys[this.name] ?  objSum(allFactorys[this.name], factoryNumbers) : factoryNumbers;
    let materials = this.getMaterialPerSec(factoryNumbers);
    if (materials) {
      for (let item in materials) {
        allMaterialsPerSec[item] = allMaterialsPerSec[item] ? allMaterialsPerSec[item] + materials[item] : materials[item];
        itemsLib[item].calcTechLine(materials[item], factorysLevel);
      }
    }
  }
  getResult(itemsPerSec, factorysLevel) {
    allMaterialsPerSec = {};
    allFactorys = {};
    this.calcTechLine(itemsPerSec, factorysLevel);
    console.log(allMaterialsPerSec);
    console.log(allFactorys);
  }
}

const objSum = (objA, objB) => {
  let obj = {};
  Object.keys(objA).forEach(key => {
    obj[key] = Number((objA[key] + objB[key]).toFixed(2));
  });
  return obj;
}

const factoryProduction = {
  1: 0.5,
  2: 0.75,
  3: 1.25
}
const meltingTime = 3.2;
const meltingTimeSteel = 16;
const extractionTime = 1.428; // 2
const extractionTimeUranium = extractionTime / 2;
let allMaterialsPerSec = {};
let allFactorys = {};
let itemsLib = {};

// LIB

itemsLib.transportBelt = new item('transport belt', 0.5, 2, {
  ironGearWheel: 1,
  ironPlate: 1
});
itemsLib.ironGearWheel = new item('iron gear wheel', 0.5, 1, {
  ironPlate: 2
});
itemsLib.ironPlate = new item('iron plate', meltingTime, 1, {
  ironOre: 1
}, 'melting');
itemsLib.copperPlate = new item('copper plate', meltingTime, 1, {
  copperOre: 1
}, 'melting');
itemsLib.steelPlate = new item('steel plate', meltingTimeSteel, 1, {
  ironPlate: 5
}, 'melting');
itemsLib.ironOre = new item('iron ore', extractionTime, 1, null, 'ore');
itemsLib.coal = new item('coal', extractionTime, 1, null, 'ore');
itemsLib.copperOre = new item('copper ore', extractionTime, 1, null, 'ore');
itemsLib.stone = new item('stone', extractionTime, 1, null, 'ore');
itemsLib.uraniumOre = new item('uranium Ore', extractionTimeUranium, 1, null, 'ore');
itemsLib.crudeOil = new item('crude oil', 0.5, 1, null, 'raw oil');

function addElem(parent, content, elem = 'DIV') {
  let item = document.createElement(elem);
  item.innerText = content;
  parent.appendChild(item);
}

// Interface

function forEachNodeList(nodeList, callBack) {
  Array.prototype.forEach.call(nodeList, callBack);
}

const lib = document.getElementById('lib');
const infoDisplay = document.getElementById('info');
const fieldItemPerSec = document.getElementById('itemPerSec');
const fieldFactoryLevel = document.getElementById('factoryLevel');
let valueItemPerSec = 1;
let valueFactoryLevel = 1;

fieldItemPerSec.addEventListener('change', () => {
  valueItemPerSec = fieldItemPerSec.value;
});
fieldFactoryLevel.addEventListener('change', () => {
  valueFactoryLevel = fieldFactoryLevel.value;
});


for (let entity in itemsLib) {
  addElem(lib, itemsLib[entity].name, 'LI');
}

const list = lib.querySelectorAll('li');

document.addEventListener('click', e => {
  forEachNodeList(list, elem => {
    if (e.target === elem) {
      for (let entity in itemsLib) {
        if (itemsLib[entity].name === elem.innerText) {
          itemsLib[entity].getResult(valueItemPerSec, valueFactoryLevel);
          infoDisplay.innerHTML = '';
          for (let material in  allMaterialsPerSec) {
            let content = `${material} - ${allMaterialsPerSec[material]}`
            addElem(infoDisplay, content);
          }
          for (let factoryObj in  allFactorys) {
            addElem(infoDisplay, factoryObj);
            for (let factoryLevel in allFactorys[factoryObj]) {
              let content = `${factoryLevel} - ${allFactorys[factoryObj][factoryLevel]}`
              addElem(infoDisplay, content);
            }
          }
        }
      }
    }
  });
});
