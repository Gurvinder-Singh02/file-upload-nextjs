import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing so we can handle it manually
  },
};

export async function POST(request: Request) {
  // Parse the incoming form data
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file || typeof file === 'string') {
    return new Response('No file uploaded', { status: 400 });
  }

  // Define the upload directory
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate a unique filename based on timestamp
  const filename = Date.now() + path.extname(file.name);
  const filePath = path.join(uploadDir, filename);

  // Save the file to the local directory
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    fs.writeFileSync(filePath, buffer);


    return new Response(JSON.stringify({ message: 'File uploaded successfully', filename }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return new Response('Error saving file', { status: 500 });
  }
}
