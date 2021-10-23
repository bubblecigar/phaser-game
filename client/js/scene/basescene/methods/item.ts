import _ from 'lodash'
import Phaser from 'phaser'
import items from '../../../items'
import { Bullet, Item } from '../../../Interface'
import collisionCategories from '../collisionCategories'

export const createItemMatter = (scene, itemConstructor: Item | Bullet) => {
  const item = items[itemConstructor.itemKey]
  const { size, origin } = item.matterConfig
  const { x, y } = itemConstructor.position
  const Bodies = Phaser.Physics.Matter.Matter.Bodies
  let body
  const options = {
    ignoreGravity: true
  }
  if (item.matterConfig.type === 'circle') {
    body = Bodies.circle(x, y, size.radius, options)
  } else if (item.matterConfig.type === 'rectangle') {
    body = Bodies.rectangle(x, y, size.width, size.height, options)
  } else {
    return // creation fail
  }

  const phaserObject = scene.matter.add.sprite(x, y, item.spritesheetConfig.spritesheetKey)
  phaserObject.setExistingBody(body)
  item.animsConfig.idle && phaserObject.play(item.animsConfig.idle.key)
  phaserObject.setOrigin(origin.x, origin.y)
  phaserObject.setSensor(true)
  phaserObject.setData(itemConstructor)
  phaserObject.setVelocityX(itemConstructor.velocity.x)
  phaserObject.setVelocityY(itemConstructor.velocity.y)
  const angle = Math.atan2(itemConstructor.velocity.y, itemConstructor.velocity.x)
  const degree = 180 * angle / Math.PI
  phaserObject.setAngle(degree)
  phaserObject.setCollisionCategory(collisionCategories.CATEGORY_ITEM)

  return phaserObject
}