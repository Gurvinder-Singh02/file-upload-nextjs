# File Upload Frontend

## update Name :

1. `formSchema` with zod update that
2. useForm update `defaultValues` for img : its null 
3. **Update the `name` in `<FormField />`** to match the field you’re adding.\

- Remove  `{..fields}` bcz we doing onChange manually
    
    
    `{...field}`  dynamilly link values onChange with state like we do in react useState
    
    ```html
    <input {...field} />
    <input name = “” value = {} onChnage = {} />
    ```
    
    ```jsx
    field.name 
    field.value
    field.onChange={}
    ```
    
    > **No need to manually handle validation or state or onChange management**—React Hook Form does that for you behind the scenes.
    > 
    
    otherwise error will be through the uncontrolled elements kinda kush 
    

- **Change the `type` in `<Input />`**
    
    ```jsx
     <input type="file" accept="image/*" onChange={handleFileChange} />
    ```
    
- `handelFileChange` to save file in form manually and update preview
    
    ```jsx
       const handleFileChange = (e) => {
       
            const file = e.target.files ? e.target.files[0] : null // go the file after change
            
            if (file) {
                form.setValue('file', file) // manually update form 
                setImagePreview(URL.createObjectURL(file)) //hook to preview file 
            }
        }
    ```
    

- Access the value in `onSubmit(value)`
    
    
    so the username is done by ..fields 
    
    and file is set by handel file change `form.setValue('file', file)`
    
    so we have values of both in forms
    
    ```jsx
     async function onSubmit(values: z.infer<typeof formSchema>) {
    
            console.log("these are values: ", values);
    
            const formData = new FormData(); // multipart/form-data class
            
            // add to the FormData 
            formData.append("username", values.username);
            formData.append("file", values.file); // file should be appended from form data
    
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData, // Send formData here
            });
    
            const result = await response.json();
            alert(JSON.stringify(result)); // This will include file details from the response
    }
    ```
    

- full code

---

# File Upload Backend

- either api  route and call
    
    ```jsx
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
      const file = formData.get('file') as FormDataEntryValue;
    
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
    
    ```
    
- either server side actions
    
    <aside>
    
    Server actions are always async
    
    </aside>
    
    action.ts
    
    ```tsx
    "use server"
    
    export const uploadAction = async (formData:any)=>{
        console.log("serever alli side " , formData)
    }
    
    ```
    
    page.tsx
    
    ```jsx
    async function onSubmit(values: z.infer<typeof formSchema>) {
            console.log("these are values: ", values);
    
            const formData = new FormData();
            formData.append("username", values.username);
    
            formData.append("file", values.file); // file should be appended from form data
    
            
            const result = await uploadAction(formData) // call server fn
    
            // const response = await fetch("/api/upload", {
            //     method: "POST",
            //     body: formData, // Send formData here
            // });
    
            // const result = await response.json();
    
            alert(JSON.stringify(result)); // This will include file details from the response
    }
    
    ```
    
- sending file to cloud with server actions
    
   
    
    ```tsx
    "use server";
    
    import { v2 as cloudinary } from "cloudinary";
    import multer from "multer";
    import { CloudinaryStorage } from "multer-storage-cloudinary";
    
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    // Setup Cloudinary storage
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: "uploads",
        },
    });
    
    // Create multer upload instance
    const upload = multer({ storage: storage });
    
    export async function uploadAction(formData: FormData) {
    
        const file = formData.get("file");
        
        if (!file) {
            return { success: false };
        }
    
        // Convert file to buffer
        const bytes = await (file as File).arrayBuffer();
        const buffer = Buffer.from(bytes);
    
        // Create file object for multer
        const fileObject = {
            fieldname: 'file',
            originalname: (file as File).name,
            buffer: buffer
        };
    
        try {
            // Upload directly to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "uploads" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
    
                // Write buffer to stream
                const bufferStream = require('stream').Readable.from(buffer);
                bufferStream.pipe(uploadStream);
            });
    
            return {
                success: true,
                url: result.secure_url
            };
    
        } catch (error) {
            return { success: false };
        }
    }
    ```