// @flow
import Phaser from 'phaser'
import HelloWorldScene from './scenes/HelloWorldScene'
import GameScene from './scenes/GameScene'

const config = {
	type: Phaser.AUTO,
	width: screen.width - 21,
	height: screen.height*0.83,
	backgroundColor: '#ffffff', // noir : '#000000' ; blanc : '#ffffff'
	physics: {
		default: 'arcade'
	},
	scene: [GameScene, HelloWorldScene]
}

export default new Phaser.Game(config)
