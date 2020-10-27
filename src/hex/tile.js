import { Organism } from "../anatomy/organism"
import GameScene from "../scenes/GameScene"

export class Tile {
    constructor(){
        this.sprite = 'hex'
        this.temperature = 20
        this.mineralElements = {
            CO2: 0,
            N2: 0,
            H20: 0,
            NH3: 0
        }
        this.organicElements = {
            O2: 0
        }
        this.biome = new Map()
    }
    insert(organism){
        this.biome.set(organism.key, organism)
    }
    search(organism){
        return this.biome.get(organism.key)
    }
    hasTarget(organism){
        return this.biome.has(organism.key)
    }
    hasOrganisms(){
        return this.biome.size > 0
    }
    organisms(){
        return this.biome.values()
    }
    allKeys(){
        return this.biome.keys()
    }
    remove(organism){
        let deleted = this.biome.get(organism.key)
        this.biome.delete(organism.key)
        return deleted
    }
}