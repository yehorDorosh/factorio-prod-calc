const item = class {
  constructor(name, prodTime, numOutItems, materials) {
    this.name = name;
    this.prodTime = prodTime;
    this.numOutItems = numOutItems;
    this.materials =  materials;
  }
  getItemsPerSec() {
    return 1 / this.prodTime
  }
  getMaterialPerSec() {
    let itemsPerSec = this.getItemsPerSec();
    for(let material in this.materials) {
      let currentMaterialPerSec = this.materials[material] * itemsPerSec;
      return console.log(`${this.name} - ${itemsPerSec}/sec, Need: ${itemsLib[material].name} - ${currentMaterialPerSec}/sec`);
    }
  }
}

let itemsLib = {};

itemsLib.transportBelt = new item('transport belt', 0.5, 2, {
  ironGearWheel: 1,
  ironPlate: 1
});
itemsLib.ironGearWheel = new item('iron gear wheel', 0.5, 1, {
  ironPlate: 2
});
itemsLib.ironPlate = new item('iron plate', 3.2, 1, {
  ironOre: 1
});
itemsLib.ironOre = new item('iron ore', 2, 1, null);
console.log(itemsLib);
