import { Hex } from './hex.js'
import { Tile } from './tile.js'

const hash = (key) => typeof key === 'string' ? key : JSON.stringify(key)

export class Grid {
    constructor(radius){
        this.radius = radius
        this.size = 3*radius*(radius + 1) + 1
        this.map = new Map()
        this.generate()
    }
    // key as a Hex (cube) coordinates
    insert(key, value){
        this.map.set(hash(key), value)
    }
    search(key){
        return this.map.get(hash(key))
    }
    hasTile(key){
        return this.map.has(hash(key))
    }
    allKeys(){
        return this.map.keys()
    }
    allTiles(){
        return this.map.values()
    }
    remove(key){
        let deleted = this.map.get(hash(key))
        this.map.delete(hash(key))
        return deleted
    }
    generate(){
        for(let q = -this.radius; q <= this.radius; ++q){
            for(let r = -this.radius; r <= this.radius; ++r){
                for(let s = -this.radius; s <= this.radius; ++s){
                    if (Math.round(q + r + s) === 0){
                        this.insert(new Hex(q,r,s), new Tile())
                    }                    
                }
            }
        }
    }
}
class Tests {
    constructor(){ }
    static equal(name, a, b){
        if (!(a === b)){
            complain(name);
        }
    }
    static equalHex(name, a, b){
        if (!(a.q === b.q && a.s === b.s && a.r === b.r)){
            complain(name);
        }
    }
    static equalHexArray(name, a, b){
        Tests.equal(name, a.length, b.length);
        for (var i = 0; i < a.length; i++){
            Tests.equalHex(name, a[i], b[i]);
        }
    }
    static testGridSize(){
        Tests.equal("grid_size", 1, new Grid(0).size)
        Tests.equal("grid_size", 7, new Grid(1).size)
        Tests.equal("grid_size", 19, new Grid(2).size)
        Tests.equal("grid_size", 37, new Grid(3).size)
        Tests.equal("grid_size", 61, new Grid(4).size)
        Tests.equal("grid_size", 91, new Grid(5).size)
        Tests.equal("grid_size", 721, new Grid(15).size)
    }
    static testSearch(){
        let testWorld = new Grid(3)
        testWorld.insert(new Hex(0,0,0), {name: "Origin"})
        Tests.equal("search", "Origin", testWorld.search(new Hex(0,0,0)).name)
    }
    static testRemove(){
        let testWorld = new Grid(3)
        Tests.equalHex("grid_remove", [new Hex(0,0,0), null], testWorld.remove(new Hex(0,0,0)))
        Tests.equalHex("grid_remove", [new Hex(0,0,0), null], testWorld.remove(new Hex(0,-1,1)))
    }
    static testInsert(){
        let testWorld = new Grid(3)
        testWorld.insert(new Hex(4,0,-4), {name: "Test"})       
        Tests.equal("search", "Test", testWorld.search(new Hex(4,0,-4)).name)
    }
    static testHasTile(){
        let testWorld = new Grid(3)
        Tests.equal("hasTile", true, testWorld.hasTile(new Hex(0,0,0)))
    }
    static testGenerate(){
        Tests.equalHexArray("grid_generate", [
            JSON.stringify(new Hex(-1,0,1)),
            JSON.stringify(new Hex(-1,1,0)),
            JSON.stringify(new Hex(0,-1,1)),
            JSON.stringify(new Hex(0,0,0)),
            JSON.stringify(new Hex(0,1,-1)),
            JSON.stringify(new Hex(1,-1,0)),
            JSON.stringify(new Hex(1,0,-1))],
            Array.from(new Grid(1).allKeys()))
    }
    static testAll(){
        Tests.testGridSize();
        Tests.testSearch();
        Tests.testRemove();
        Tests.testInsert();
        Tests.testHasTile();
        Tests.testGenerate();
    }
}
// Tests
function complain(name){ console.log("FAIL", name); }
Tests.testAll();