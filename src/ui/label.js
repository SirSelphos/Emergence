import Phaser from 'phaser'

const format = (name, score) => `${name}:		${score}`

export default class Label extends Phaser.GameObjects.Text
{
	constructor(scene, x, y, name, score, style){
		super(scene, x, y, format(name, score), style)
		this.name = name
		this.score = score
	}
	updateScoreText(){
		this.setText(format(this.name, this.score))
	}
	setScore(score){
		this.score = score
		this.updateScoreText()
	}
	add(points){
		this.setScore(this.score + points)
	}
}