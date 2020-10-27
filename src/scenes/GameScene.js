import Phaser from 'phaser'
import { Point, Layout, Hex } from '../Hex/hex.js'
import { Grid } from '../Hex/grid.js'
import { Organism } from '../anatomy/organism.js'
import Label from '../ui/label.js'

const origin = new Point((screen.width - 21)/2, (screen.height*0.83)/2)
const hexSize = new Point(12,12)
export const layout = new Layout(Layout.flat, hexSize, origin)
const worldSize = {
	tiny: 3,
	small: 13,
	medium: 18,
	large: 35,
	huge: 60,
}

export default class GameScene extends Phaser.Scene
{
	constructor()
	{
		super('game-scene')
		this.gameOver = false
		this.speed = 4
		this.turn = Math.round(1000/this.speed) // in milliseconds
	}
	preload()
	{
		this.load.image('hex', 'assets/hexagon-tile.png')
		this.load.image('seaweeds', 'assets/seaweeds.png')
		this.load.image('ameba', 'assets/ameba.png')
		this.load.image('litonotus', 'assets/predator.png')
	}
	create()
	{	// World
		this.world = new Grid(worldSize.medium)
		this.populate(this.world)		
		// Labels
			// First player's organism only, main parameters to chose the most efficient organism of its generation
		this.lifetimeLabel = this.createLabel(16, 16, 'Lifetime', this.player.lifetime)
		this.childrenLabel = this.createLabel(16, 32, 'Children', this.player.children)
			// Organism's resources
		this.healthLabel = this.createLabel(16, 64, 'Health (%)', this.player.health)
		this.satietyLabel = this.createLabel(16, 80, 'Satiety (%)', this.player.satiety)		
		this.energyLabel = this.createLabel(16, 96, 'Energy (%)', this.player.energy)
			// Game speed
		this.speedLabel = this.createLabel(16, 128, 'Speed:', this.speed)
		// TimedEvent
		this.timedEvent = this.time.addEvent({ delay: this.turn, callback: this.onEvent, callbackScope: this, loop: true })
		/*
		this.input.on('pointerdown', function () {

			if (this.timedEvent.paused)
			{
				this.timedEvent.paused = false;
			}
			else
			{
				this.timedEvent.paused = true;
			}
	
		});
		*/
	}
	update(){
		// Game's logic and interactions (play, pause, speed...)
		if (this.gameOver)
		{
			return;
		}
		// Labels' refresh (to be modified to follow the selected organism)
		if(this.player.health <= 0 || this.player.lifetime >= this.player.lifeExpectancy){
			this.lifetimeLabel.setScore(this.player.lifetime + "(dead)")
		}
		else{
			this.lifetimeLabel.setScore(this.player.lifetime)
		}		
		this.childrenLabel.setScore(this.player.children)
		this.healthLabel.setScore(this.player.health)		
		this.satietyLabel.setScore(this.player.satiety)
		this.energyLabel.setScore(this.player.energy)
		this.speedLabel.setScore(this.speed)
	}
	onEvent(){
		for(let tile of this.world.allTiles()){
			if(tile.hasOrganisms()){
				for(let organism of tile.organisms()){
					// if this is the end of the road...
					if(organism.health <= 0 || organism.lifetime >= organism.lifeExpectancy){
						organism.dies()
						this.world.search(organism.getPosition()).remove(organism)
					}
					else{
						organism.lives()
					}
				}
			}			
		}
	}
	// Tiles'images & NPC
	populate(world){
		// Player
		this.world.search(new Hex(0,0,0)).insert(
			this.player = new Organism(
			// Automatic:
			this, // scene
			new Hex(0,0,0), // position, as origin here
			0, // direction, 0 is North, clockwize,
			1, // depth
			/*------------------------------------------*/
			// Chosen starting parameters:
			'ameba', // sprite
			'Amoeba vulgaris', // species' name
			'Alga alligata', // diet
			150 + Phaser.Math.Between(-10, 10), // life expectancy
			30 + Phaser.Math.Between(-1, 1), // attack power
			2, // range of detection, 0 for blind
			2 // type of mobility, 0 for static, 1 for roamer, 2 for drifter, 3 for seeker
			// + Reproduction parameters at start ?
			// + Ressources pools ?
		))
		console.log("This player:", this.player)
		// Tiles and other species
		for (let tile of world.allKeys()){
			this.add.image(
				layout.hexToPixel(tile).x,
				layout.hexToPixel(tile).y,
				world.search(tile).sprite
			)
			// Basic autotrophs
			if(Phaser.Math.Between(1, 8) === 1){
				this.world.search(tile).insert(
				new Organism(
					this, // scene
					JSON.parse(tile), // position
					Phaser.Math.Between(0, 5), // direction
					0, // depth
					'seaweeds', // sprite
					'Alga alligata' // species' name
				))
			}
			/*
			// Predators
			if(Phaser.Math.Between(0, 200) === 1 && tile != this.player.getPosition()){
				this.world.search(tile).insert(
				new Organism(
					this, // scene
					JSON.parse(tile), // position
					Phaser.Math.Between(0, 5), // direction
					2, // depth
					'litonotus', // sprite
					'Litonotus fasciola', // species' name
					'Amoeba vulgaris', // diet
					150, // life expectancy
					100, // attack power
					2, // range of detection, 0 for blind
					2 // type of mobility, 0 for static, 1 for roamer, 2 for drifter, 3 for seeker
				))
			}
			*/
		}
	}
	// UI
	createLabel(x, y, name, score)
	{
		const style = { fontSize: '16px', fill: '#000000' }
		const label = new Label(this, x, y, name, score, style)
		this.add.existing(label)
		return label
	}	
}