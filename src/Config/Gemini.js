
// ===== INSTALL FIRST =====
// npm install @google/genai mime

import { GoogleGenAI } from '@google/genai'
import mime from 'mime'
import fs from 'fs'
import path from 'path'

// ✅ Hardcoded API key
const API_KEY = "AIzaSyASfIA6tDGZmr3CJHDMjqgjNRddD7maQrI"

// ========== HELPER FUNCTION TO SAVE FILE ==========
function saveBinaryFile(fileName, content) {
  const outputDir = './outputs'

  // Create outputs folder if not exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  const filePath = path.join(outputDir, fileName)

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(`❌ Error writing file ${fileName}:`, err)
      return
    }
    console.log(`✅ File saved: ${filePath}`)
  })
}

// ========== MAIN FUNCTION ==========
async function main() {
  const ai = new GoogleGenAI({
    apiKey: API_KEY,
  })

  const config = {
    responseModalities: ['IMAGE', 'TEXT'],
  }

  const model = 'gemini-2.5-flash-image'

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: 'Generate an image of a futuristic solar-powered city at sunset.',
        },
      ],
    },
  ]

  console.log('🚀 Generating response...')

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  })

  let fileIndex = 0

  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) continue

    const part = chunk.candidates[0].content.parts[0]

    // 📸 If the model returns an image
    if (part.inlineData) {
      const fileName = `gemini_output_${fileIndex++}`
      const inlineData = part.inlineData
      const fileExtension = mime.getExtension(inlineData.mimeType || 'png')
      const buffer = Buffer.from(inlineData.data || '', 'base64')
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer)
    }

    // 💬 If the model returns text
    else if (part.text) {
      console.log('📝 Text Output:\n', part.text)
    }
  }

  console.log('✅ Process completed.')
}

main().catch((err) => console.error('❌ Error:', err))
