const item = class {
  constructor(name, prodTime, numOutItems, materials, israwMaterials) {
    this.name = name;
    this.prodTime = prodTime;
    this.numOutItems = numOutItems;
    this.materials =  materials;
    this.israwMaterials = israwMaterials;
  }
  prodMult(factoryLevel = 1, ovenMult = 1) {
    return this.isOre ? ovenMult : factoryProduction[factoryLevel];
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
const extractionTime = 2;
let allMaterialsPerSec = {};
let allFactorys = {};
let itemsLib = {};

itemsLib.transportBelt = new item('transport belt', 0.5, 2, {
  ironGearWheel: 1,
  ironPlate: 1
});
itemsLib.ironGearWheel = new item('iron gear wheel', 0.5, 1, {
  ironPlate: 2
});
itemsLib.ironPlate = new item('iron plate', meltingTime, 1, {
  ironOre: 1
}, true);
itemsLib.ironOre = new item('iron ore', extractionTime, 1, null, true);
console.log(itemsLib);
