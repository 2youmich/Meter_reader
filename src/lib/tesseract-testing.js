import { createWorker } from 'tesseract.js'

import imgSrc from '@/assets/images/1722397552068.jpg'

/**
 * Return a string of the text that it will try to read from the image
 */
export async function readImageText(src = imgSrc) {
  // await will not run the code below, until this image is loaded and resolved
  const worker = await createWorker('eng')

  // then it will go ahead with this code
  const ret = await worker.recognize(src)

  console.log(ret.data.text)
  await worker.terminate()

  return ret.data.text
}
