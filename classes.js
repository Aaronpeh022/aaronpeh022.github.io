class Sprite {
    constructor({
        position,
        velocity,
        image,
        frame = { max: 1, hold: 10 },
        sprites = [],
        animate = false,
        rotation = 0
    }) {
        this.position = position
        this.image = new Image()
        this.frame = { ...frame, val: 0, elapsed: 0 }
        this.image.onload = () => {
            this.width = this.image.width / this.frame.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    }

    draw() {
        c.save()
        c.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2)
        c.rotate(this.rotation)
        c.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2)
        c.globalAlpha = this.opacity
        c.drawImage(
            this.image,
            this.frame.val * this.width,
            0,
            this.image.width / this.frame.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frame.max,
            this.image.height
        )
        c.restore()
        if (!this.animate) return
        if (this.frame.max > 1) {
            this.frame.elapsed++
        }
        if (this.frame.elapsed % this.frame.hold === 0) {
            if (this.frame.val < this.frame.max - 1) this.frame.val++
            else this.frame.val = 0
        }
    }
}

class Monster extends Sprite {
    constructor({
        position,
        velocity,
        image,
        frame = { max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position,
            velocity,
            image,
            frame,
            sprites,
            animate,
            rotation
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }

    faint() {
        document.querySelector('#dialogueBox').innerHTML = this.name + " fainted!"
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play()
    }

    attack({ attack, recipient, renderedSprites }) {

        document.querySelector('#dialogueBox').style.display = "block"
        document.querySelector('#dialogueBox').innerHTML = this.name + " used " + attack.name

        recipient.health -= attack.damage

        let rotation = 1
        if (this.isEnemy) rotation = -2.2

        let healthBar = "#enemyHealthBar"
        if (this.isEnemy) healthBar = "#selfHealthBar"

        switch (attack.name) {
            case 'Fireball':
                audio.initFireball.play()
                const fireballImage = new Image()
                fireballImage.src = "./img/fireball.png"
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frame: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation
                })

                renderedSprites.splice(1, 0, fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        audio.fireballHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health - attack.damage + '%'
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1)
                    }
                })

                break
            case 'Tackle':
                const tl = gsap.timeline()

                let movementDistance = 20
                if (this.isEnemy) movementDistance = -20

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        audio.tackleHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health - attack.damage + '%'
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;
        }
    }
}

class Boundary {
    static width = 48
    static height = 48
    constructor({ position }) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

