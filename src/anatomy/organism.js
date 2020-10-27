import { Hex } from "../Hex/hex"
import { layout } from "../scenes/GameScene"

let serial = 0

export class Organism {
    constructor(
        scene,
        position,
        direction,
        depth,
        sprite,
        species,
        diet,
        lifeExpectancy,
        attackPower,
        rangeOfDetection,
        typeOfMobility,
        driftCoefficient,
        typeOfReproduction,
        sexualMajority,
        reproductionThreshold,
        generation
        ){
        // Organism's key
        this.key = ++serial
        // Space
        this.scene = scene
        this.position = position
        this.direction = direction ?? Phaser.Math.Between(0, 5) // index of directions' array, 5 is the North, 2 is the South, clockwise
        // Graphics
        this.depth = depth ?? 0
        this.sprite = sprite
        this.image = undefined
        // Species
        this.species = species
        // Health
        this.health = 90 + Phaser.Math.Between(-10, 10) // %
        // Energy
        this.energy = 10 + Phaser.Math.Between(-5, 5) // %
        // Nutrition
        this.satiety = 50 + Phaser.Math.Between(-5, 5) // %
        this.diet = diet ?? null        
        // Time
        this.lifeExpectancy = lifeExpectancy ?? 100 + Phaser.Math.Between(-10, 10)
        this.lifetime = 0 // age in number of turns staying alive
        // Offensive
        this.attackPower = attackPower ?? 0
        // Senses
        this.rangeOfDetection = rangeOfDetection ?? 0 // range of detection
        // Mobility        
        this.typeOfMobility = typeOfMobility ?? 0 // 0 for static, 1 for roamer, 2 for drifter, 3 for seeker
        this.driftCoefficient = driftCoefficient ?? 1 // between 1 & 2 (3 would means Roamer with double chance to turn back => not good)
        // Reproduction
        this.typeOfReproduction = typeOfReproduction ?? 0 // 0 for asexual, 1 for sexual reproduction
        this.sexualMajority = sexualMajority ?? 30 + Phaser.Math.Between(-5, 5) // age to be able to reproduce
        this.reproductionThreshold = reproductionThreshold ?? 40 + Phaser.Math.Between(-5, 5) // %
        this.gender = Phaser.Math.Between(0, 1)          
        this.children = 0
        this.generation = generation ?? 0
        // Add image to GameScene
        this.addImage()
    }
    // Space
    getPosition(){
        return new Hex(this.position.q, this.position.r, this.position.s)
    }
    setPosition(position){
        this.position = position
    }
    getDirection(){
        return this.direction
    }
    setDirection(direction){
        this.direction = direction
    }
    // Graphics
    rotateImage(){
		// reintitialise image's rotation to the "zero degree" angle
		this.image.setRotation(0)
		// rotate image from zero to reach organism's direction ((PI / 180° for degree to radian) * 60° for the angle between two sides * scale of rotation)
		this.image.setRotation(Math.PI / 3 * this.getDirection())
	}
    addImage(){
		const position = layout.hexToPixel(this.getPosition())
		this.image = this.scene.add.image(
			position.x,
			position.y,
			this.sprite
		)
        this.image.setDepth(this.depth)
        this.rotateImage()
	}
	moveImage(){
		const position = layout.hexToPixel(this.getPosition())
		this.image.setPosition(position.x, position.y)
	}
	destroyImage(){
		this.image.destroy()
	}
    // Automatic actions
    dies(){
        this.destroyImage()
    }
    // Primary actions
        // Mutation : probability in percentage, two decimals allowed
    mutates(parameter, scale, maximum, probability){
        if(probability != null && Phaser.Math.Between(1, 10000) <= probability * 100){
            let mutation = parameter + Phaser.Math.Between(-scale, scale)
            // if this parameter has a limit (f.e.: if is a percentage, must be between 0 and 100%)
            if(maximum != null){
                return mutation < 0 ? 0 : mutation > maximum ? maximum : mutation
            }
            // if this parameter has no limit
            else {
                return mutation < 0 ? 0 : mutation
            }
        }
        // if the probability is null
        return parameter
    }
        // Reproduction
    noNeighbor(){
        let array = new Array ()
        for(let i = 0 ; i < 6; ++i){
            // for each position around the organism
            let destination = this.getPosition().neighbor(i)
            // if this position is in the world's map
            if(this.scene.world.hasTile(destination)){
                // if this position contains organisms
                if(this.scene.world.search(destination).hasOrganisms()){
                    let available = true
                    // for each organism on this position
                    for(let organism of this.scene.world.search(destination).organisms()){
                        // if their species are the same, position is overcrowded
                        if(organism.species == this.species){
                            available = false
                        }
                    }
                    if(available == true){
                        array.push(destination)
                    }
                }
                else{
                    // is the position is totally free
                    array.push(destination)
                }
            }
        }
        return array
    }
    reproduces(){
        const available = this.noNeighbor()
        if(available.length > 0){
            let random = Phaser.Math.Between(0, available.length - 1)
            let position = available[random]
            let child = undefined
            this.scene.world.search(position).insert(
                child = new Organism(
                this.scene,
                position, // available position
                Phaser.Math.Between(0, 5), // random direction
                this.depth,
                this.sprite,
                this.species,
                this.diet, // need to think about a possible mutation => index of a species' array !
                // Mutations(parameter, scale in both directions, maximum or percentage, probability)
                this.mutates(this.lifeExpectancy, 10, null, 100),
                this.mutates(this.attackPower, 5, 100, 80),
                this.mutates(this.rangeOfDetection, 1, null, 50),
                this.mutates(this.typeOfMobility, 1, 2, 15), // maximum 2, or more if new types (seeker, hunter ?)
                this.mutates(this.driftCoefficient, 1, 2, 30),
                this.mutates(this.typeOfReproduction, 1, 1, 0.01),
                this.mutates(this.sexualMajority, 1, this.lifeExpectancy, 80),
                this.mutates(this.reproductionThreshold, 1, 100, 50),
                this.generation + 1,
            ))
            ++this.children
            if(this === this.scene.player){
                console.log(`Child n°${this.children}:`, child)
            }
            // Resources' cost
            this.satiety -= (this.reproductionThreshold - Phaser.Math.Between(0, this.reproductionThreshold))
            this.energy -= (this.reproductionThreshold - Phaser.Math.Between(0, this.reproductionThreshold))
        }
    }
        // Nutrition and wealth
    feeds(){
        // if the organism is heterotroph
        if(this.diet != null){      
            let tile = this.scene.world.search(this.getPosition())      
            if(tile.hasOrganisms() && this.satiety <= 90){
                for(let organism of tile.organisms()){
                    if(organism.species === this.diet){
                        organism.health = 0
                        this.satiety += 10
                        return // only one organism can be attacked each turn
                    }  
                }
            }
            // if no food on this tile
            if(this.energy >= 1){
                this.moves() 
            }      
        }
        // if the organism is an autotroph, it slowly absorbs gas and mineral matter to produce its own organic material
        else {
            for(let i = 0; i < 1; ++i){ // the number 2 can become a variable of photosynthesis' efficiency
            this.satiety < 100 ? this.satiety += 1 : null            
            }
        }
    }
    digests(){
        this.satiety >= 5 ? this.satiety -= 5 : this.satiety = 0
        this.energy += 10
    }
    heals(){
        this.energy >= 1 ? this.energy -= 1 : this.energy = 0
        this.health += 1
    }
    // Advanced actions
        // Environment
    checks(parameter){ // param as 'predators', 'food' or 'mates', and others when the environmental system will be operational
        let array = new Array ()
        // if this organism can check
        if(this.rangeOfDetection > 0){
            // in scope of organism's range of detection
            for(let q = -this.rangeOfDetection; q <= this.rangeOfDetection; ++q){
                for(let r = -this.rangeOfDetection; r <= this.rangeOfDetection; ++r){
                    for(let s = -this.rangeOfDetection; s <= this.rangeOfDetection; ++s){
                        // if the coordinates are valid
                        if (Math.round(q + r + s) === 0){
                            let destination = new Hex(q,r,s)
                            // if the tile checked is in the world's map 
                            if(this.scene.world.hasTile(destination)
                            // and isn't at organism's position
                            && destination != this.getPosition()){
                                // if the destination contains organism
                                if(this.scene.world.search(destination).hasOrganisms()){
                                    // for each organism on this position
                                    for(let organism of this.scene.world.search(destination).organisms()){
                                        switch(parameter){
                                            case 'predators':
                                                // if the organism checked is a predator
                                                if(organism.diet === this.species){
                                                    array.push(destination)
                                                }
                                                break;
                                            case 'food':
                                                // if the organism checked is part of the diet
                                                if(organism.species === this.diet){
                                                    array.push(destination)
                                                }
                                                break;
                                            case 'mates':
                                                // if the organism is from the same species and has an opposite gender
                                                if(organism.species === this.species && organism.gender != this.gender){
                                                    array.push(destination)
                                                }
                                                break;
                                            default:
                                                console.log(`Sorry, we are out of ${parameter}.`);
                                        }                                    
                                    }
                                }
                            }
                        }                    
                    }
                }
            }
        }
        return array
    }
    attacks(organism){
        let targetsHealth =  organism.health - this.attackPower
        targetsHealth < 0 ? organism.health = 0 : organism.health = targetsHealth
        this.energy >= 1 ? this.energy -= 1 : this.energy = 0
    }
        // Mobility
    roams(){
        this.setDirection(Phaser.Math.Between(0, 5))
    }
    drifts(){
        // Random scale
        let RandomAmplitude = Phaser.Math.Between(0, this.driftCoefficient)
        // if amplitude == 0 => this.direction stills the same => this goes straight 
        // else left or right according to a random turning point
        let RandomTurningPoint = Phaser.Math.Between(0, 1)
        for(let i =0; i < RandomAmplitude; ++i){
            if(RandomTurningPoint != 0){
                let previous = this.getDirection()
                this.setDirection(++previous % 6)
            }
            else if (this.getDirection() === 0) {
                this.setDirection(5)
            }
            else {
                let previous = this.getDirection()
                this.setDirection(--previous)
            }
        } 
    }
    seeks(parameter){
        // We check the surroundings according to param
        let checked = this.checks(parameter)
        if(this === this.scene.player){
            console.log("Player's", parameter, "detected:", checked.length > 0 ? true : false)
        }
        if(checked.length > 0){
            let closest = this.rangeOfDetection
            let target = undefined
            for(let position of checked){
                // We trying to define the closest target in this check's result
                let distance = this.getPosition().distance(position)
                // if the organism'distance is smaller than others, and not yet on us
                if(distance > 0 && distance <= closest){
                    closest = distance
                    target = position
                }
            }
            console.log(`Distance: ${closest}, target's position: ${target}`)
            // We draw a line between us and the target, and stock the path in an array
            let results = this.getPosition().linedraw(target)
            console.log("Results", results)
            switch(parameter){
                case 'predators':
                    // if the closest organism checked is a predator, we go at the opposite
                    for(let i = 0; i < 6; ++i){
                        if(results[1] === this.getPosition().neighbor(i)){
                            // we set an opposite course
                            this.setDirection((i+3)%6)
                            console.log("Predator's direction:", this.getDirection())
                            break
                        }
                    }
                    break;
                case 'food':
                    // if the closest organism checked is part of the diet, we try to go in this way
                    for(let i = 0; i < 6; ++i){
                        if(results[1] === this.getPosition().neighbor(i)){
                            this.setDirection(i)
                            console.log("Food's direction:", this.getDirection())
                            break
                        }
                    }
                    break;
                case 'mates':
                    // if the closest organism is from the same species and has an opposite gender, we try to go in this way
                    for(let i = 0; i < 6; ++i){
                        if(results[1] === this.getPosition().neighbor(i)){
                            this.setDirection(i)
                            console.log("Mate's direction:", this.getDirection())
                            break
                        }
                    }
                    break;
                default:
                    console.log(`Sorry, we are out of ${parameter}.`);
            }
            // rotating organism's image according to new direction
            this.rotateImage()
        }
        /*
        // else this moves randomly to try to find food
        else {
            this.drifts()
        }
        */
    }
    setsCourse(parameter){
        // Mobility adaptation to detection capability:
        // if the organism hasn't or has loose its detection capability (blind)
        /*
        if(this.rangeOfDetection < 1
        // and had a type of mobility based on detection
        && this.typeOfMobility > 2){            
            // he has now to move randomly, "blind"
            this.typeOfMobility = 2
        }
        // if the organism isn't static by nature and has or had aquired a detection capability
        if(this.rangeOfDetection > 0
        // and isn't static
        && this.typeOfMobility != 0){
            // its mobility behavior changes to "seeker"
            this.typeOfMobility = 3
        }
        */
        // then:
        switch (this.typeOfMobility){
            case 0:
                break;
            case 1:
                this.roams()
                break;
            case 2:
                this.drifts()
                break;
            case 3:
                this.seeks(parameter)
                break;
            default:
                console.log(`Sorry, we are out of ${this.typeOfMobility}.`);
        }
        // rotating organism's image according to new direction
        this.rotateImage()        
    }
    moves(){
        // defining destination
        this.setsCourse()      
        let destination = this.getPosition().neighbor(this.getDirection())
        // makes a move
        if(this.scene.world.hasTile(destination)){
            this.setPosition(destination)
            this.moveImage()
            this.energy >= 1 ? this.energy -= 1 : this.energy = 0
        }
    }
    // Actions' hierarchy in one turn
    lives(){
        // Time's influence
        if(this.energy >= 1){
            this.energy -= 1
        }
            // if is starving
        else if(this.health >= 1) {
            this.health -= 1
            if(this.typeOfMobility != 0){
                this.setsCourse()
            }
        }
        ++this.lifetime           
        // Healing
        if(this.health < this.reproductionThreshold && this.energy >= 2){
            this.heals()
            return
        }
        // Digestion
        else if(this.energy < this.reproductionThreshold && this.satiety >= 5){
            this.digests()
            return
        }
        // Nutrition
        else if(this.satiety < this.reproductionThreshold){
            this.feeds()
            return
        }
        // Reproduction
        else if(this.lifetime >= this.sexualMajority){
            this.reproduces()
        }
    }
}