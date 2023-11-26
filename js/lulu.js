
// SOURCES
// https://stackoverflow.com/questions/66601303/how-to-cancel-current-animation-and-immediately-start-new-one-with-mouse-event-a
// https://www.w3schools.com/jsref/prop_win_innerheight.asp
// https://dev.to/dillionmegida/how-to-cancel-a-settimeout-in-javascript-l2p
// https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function
// https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
// https://stackoverflow.com/questions/8860188/javascript-clear-all-timeouts
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// https://stackoverflow.com/questions/8860188/javascript-clear-all-timeouts
// https://stackoverflow.com/questions/15615552/get-div-height-with-plain-javascript
// https://stackoverflow.com/questions/15615552/get-div-height-with-plain-javascript
// https://www.w3schools.com/jsref/met_node_appendchild.asp
// https://stackoverflow.com/questions/20377835/how-to-get-css-class-property-in-javascript
// https://stackoverflow.com/questions/8497050/get-the-page-file-name-from-the-address-bar
// https://stackoverflow.com/questions/1789945/how-to-check-whether-a-string-contains-a-substring-in-javascript
// https://pixabay.com/vectors/pepper-capsicum-vegetable-food-154377/ - Pepper Images
// https://www.geeksforgeeks.org/how-to-get-current-value-of-a-css-property-in-javascript/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// https://stackoverflow.com/questions/24386354/execute-js-code-after-pressing-the-spacebar
// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

let game = null

class Lulu {
	constructor(selector, endGame) {
	  this.selector = selector
	  this.peppers = 0
	  this.lives = 3
	  this.initialVelcoity = 20
	  this.transitionTime = 35
	  this.jumpCallback = null
	  this.startingBottom = 5
	  this.consecutiveJumps  = 0
	  this.endGame = endGame


	  this.selector.style.transitionDuration = `${this.transitionTime *3}ms`
	  this.selector.style.bottom = `${5}px`
	  this.selector.style.left = `${getComputedStyle(document.querySelector("#lulu")).left}`
	}

	jump(velocity, manualCall){
		if(this.consecutiveJumps < 2 || !manualCall){
			if(velocity === this.initialVelcoity){
				this.consecutiveJumps++
				this.clearJumps()
				this.selector.style.bottom = `${parseInt(this.selector.style.bottom.replace("px",""))+ velocity}px`
				this.jump(velocity-1, false)
			}else if(velocity >= -this.initialVelcoity){
				this.jumpCallback = setTimeout(() =>{
					this.selector.style.bottom = `${parseInt(this.selector.style.bottom.replace("px",""))+ velocity}px`
					this.jump(velocity-1, false)
				},this.transitionTime)
			}else{
				let curYPosition = parseInt(this.selector.style.bottom.replace("px",""))
				if(curYPosition !== this.startingBottom){
					setTimeout(() =>{
						if(parseInt(this.selector.style.bottom.replace("px",""))+ velocity > this.startingBottom){
							this.selector.style.bottom = `${parseInt(this.selector.style.bottom.replace("px",""))+ velocity}px`
							this.jump(velocity-1, false)
						}else{
							this.consecutiveJumps = 0
							this.selector.style.bottom = `${this.startingBottom}px`
						}
					},this.transitionTime)
				}else{
					this.consecutiveJumps = 0
					this.jumpCallback = null
				}
			}
		}
	}

	clearJumps(){
		if(this.jumpCallback){
			clearTimeout(this.jumpCallback)
		}
	}

  }

class InteractionObject{
	constructor(selector, velocity, luluObjectRef, objectType, game, yPosition) {
		this.setTimoutRef = null
		this.selector = selector
		this.velocity = velocity
		this.transitionTime = 17
		this.lulu = luluObjectRef
		this.type = objectType
		this.interactionOccured = false
		this.game = game
		this.selector.style.left = `${window.innerWidth}px`
		if(objectType === "pepper"){
			this.selector.style.bottom = `${yPosition}px`
		}else{
			this.selector.style.bottom = `${5}px`
		}
	  }


	  move(){
		if(parseInt(this.selector.style.left.replace("px","")) > -this.selector.scrollWidth){
			this.setTimoutRef = setTimeout(() =>{
				this.selector.style.left = `${parseInt(this.selector.style.left.replace("px",""))- this.velocity}px`
				this.xPosition = parseInt(this.selector.style.left.replace("px",""))- this.velocity
				const interactionOccured = this.determinInteraction()
				if(interactionOccured && this.type === "pepper" && !this.interactionOccured){
					this.interaction()
					this.lulu.peppers++
					document.querySelector("#peppers").innerText = this.lulu.peppers
				}
				if(interactionOccured && this.type === "shy" && !this.interactionOccured){
					this.interaction()
					this.lulu.lives = Math.max(0,this.lulu.lives-1)
					console.log(this.lulu.lives)
					document.querySelector("#lives").innerText = this.lulu.lives
					this.lulu.selector.classList.add("damage")
					setTimeout(()=>{
						this.lulu.selector.classList.remove("damage")
					}, 3000)
					if(this.lulu.lives === 0){
						this.game.endGame()
					}
				}
				this.move()
			},this.transitionTime)
		}else{
			clearTimeout(this.setTimoutRef)
			this.selector.style.display = "none"
		}
	  }

	  interaction(){
		this.interactionOccured = true
		setTimeout(()=>{
			clearTimeout(this.setTimoutRef)
			this.selector.style.display = "none"
		},500)
	  }

	  determinInteraction(){
		const pepperWidth = this.selector.scrollWidth
		const pepperLeft = parseInt(this.selector.style.left.replace("px",""))
		const luluWidth = this.lulu.selector.scrollWidth
		const luluLeft = parseInt(this.lulu.selector.style.left.replace("px",""))
		const luluRight = luluLeft + luluWidth
		const pepperRight = pepperLeft + pepperWidth
		const pepperHeight = this.selector.scrollHeight
		const pepperBottom = parseInt(this.selector.style.bottom.replace("px",""))
		const pepperTop = pepperBottom + pepperHeight
		const luluHeight = this.lulu.selector.scrollHeight
		const luluBottom = parseInt(this.lulu.selector.style.bottom.replace("px",""))
		const luluTop = luluBottom + luluHeight
		return pepperLeft < luluRight && pepperRight > luluRight && luluBottom < pepperTop && luluTop > pepperBottom
	  }

}

class Game{
	constructor(){
		this.gameRef = document.querySelector("#game")
		this.lulu = null
		this.nextCallback = null

	}

	setupGame(){
		const luluDiv = document.createElement("div")
		document.querySelector("#end-game-modal").style.display = "none"
		luluDiv.classList = "lulu"
		luluDiv.id = "lulu"

		const luluImage = document.createElement("img")
		luluImage.src = "images/lulu-full.png"
		luluImage.alt = "Lulu, a guinea pig with white and black fur"
		luluImage.classList = "shy-img"
		luluDiv.appendChild(luluImage)


		this.gameRef.appendChild(luluDiv)
		const lulu = new Lulu(luluDiv, this.endGame)
		this.lulu = lulu
		document.querySelector("#peppers").innerText = lulu.peppers
	  	document.querySelector("#lives").innerText = lulu.lives

		window.addEventListener("keyup", (e) =>{
			if(e.key == " "){
				lulu.jump(lulu.initialVelcoity, true)
			}
		})

		window.addEventListener("touchstart", () =>{
				lulu.jump(lulu.initialVelcoity, true)
		})
	}

	getRandomVal(type){
		if(type === "velocity"){
			return Math.floor(Math.random() *4 + 3 )
		}else if(type === "position"){
			return Math.floor(Math.random() * window.innerHeight/1.5)
		}else{
			return Math.floor(Math.random() * 3 + 2) *1000
		}
	}

	resetParams(){
		document.querySelector("#end-game-modal").style.display = "none"
		this.lulu.lives = 3
		this.lulu.peppers = 0
		document.querySelector("#peppers").innerText = this.lulu.peppers
		document.querySelector("#lives").innerText = this.lulu.lives
	}


	playGame(){
		const velocity = this.getRandomVal("velocity")		
		const yPosition = this.getRandomVal("position")
		document.querySelector("#end-game-modal").style.display = "none"
		this.nextCallback = setTimeout(()=>{
			if(Math.random() > .5){
				this.addPepper(velocity, yPosition)
			}else{
				this.addShy(velocity, yPosition)
			}
			this.playGame()
		}, this.getRandomVal("time"))
	}

	addPepper(velocity, yPosition){
		const pepperDiv = document.createElement("div")
		pepperDiv.classList = "pepper"
		const pepperImage = document.createElement("img")
		const chosen = Math.floor(Math.random() * 3)
		pepperImage.src = ["images/pepper-1.png","images/pepper-2.png","images/pepper-3.png"][chosen]
		const description = ["red","yellow","green"][chosen]
		pepperImage.alt = `a ${description} bell pepper`
		pepperImage.classList = "pepper-img"
		pepperDiv.appendChild(pepperImage)
		this.gameRef.appendChild(pepperDiv)
		const pepper = new InteractionObject(pepperDiv,velocity, this.lulu, "pepper", this, yPosition)
		pepper.move()
	}

	addShy(velocity, yPosition){
		const shyDiv = document.createElement("div")
		shyDiv.classList = "shy"
		const shyImage = document.createElement("img")
		shyImage.src = "images/shy.png"
		shyImage.alt = "Shy Zhu, a guinea pig with brown, cream, and white colored fur"
		shyImage.classList = "shy-img"
		shyDiv.appendChild(shyImage)
		this.gameRef.appendChild(shyDiv)
		const shy = new InteractionObject(shyDiv,velocity, this.lulu, "shy", this, yPosition)
		shy.move()
	}

	endGame(){
		document.querySelector("#end-game-modal").style.display = "flex"
		document.querySelector("#player-score").innerText = this.lulu.peppers
		clearTimeout(this.nextCallback)
	}

}

function playAgain(){
	game.resetParams()
	game.playGame()
}

function playGame(){
	document.location.href = "game.html"
}

function returnMainMenu(){
	document.location.href = "index.html"
}

function instructions(){
	document.location.href = "instructions.html"
}

window.addEventListener("load", function() {
	if(this.document.location.pathname.includes("game")){
		if(this.getComputedStyle(this.document.querySelector("#prefers-reduced-explanation")).display == "none"){
			game = new Game()
			game.setupGame()
			game.playGame()
		}
	}
});
