// Generate unique ids for when multiple of the same component are rendered
// Especially useful for when multiple gradients are instantiated
const uniqueId = (baseId: string) => {
  let newId = baseId
  let suffix = 1

  // Prevent nextJs from running this code on the server
  if (typeof window !== 'undefined') {
    while (document.querySelector(`#${newId}`)) {
      newId = `${baseId}-${suffix}`
      suffix += 1
    }
  }

  return newId
}

export default uniqueId
