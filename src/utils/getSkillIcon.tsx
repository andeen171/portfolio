/* eslint-disable @typescript-eslint/no-var-requires */
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core'

const getIconByName = (iconName: string): IconDefinition | null => {
  try {
    const icon =
      require(`@fortawesome/free-brands-svg-icons/${iconName}`) as IconDefinition
    return icon
  } catch (error) {
    console.error(`Icon "${iconName}" not found.`)
    return null
  }
}

export default getIconByName
