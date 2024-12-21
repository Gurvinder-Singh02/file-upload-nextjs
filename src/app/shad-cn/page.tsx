"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { uploadAction } from "../actions/fileaction"


const formSchema = z.object({
    username: z.string().min(2).max(50),
    file: z
        .instanceof(File, { message: 'Please upload a file.' })
        .refine((f) => f.size < 10_000_000, 'Max 10MB upload size.')
})

const UploadForm = () => {
    const [imagePreview, setImagePreview] = useState(null)
    const [uploading, setUploading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            file: undefined,
        },
    })

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue('file', file)
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
            setImagePreview(URL.createObjectURL(file))
        }
    }

    async function onSubmit(values) {
        try {
            setUploading(true)
            const formData = new FormData()
            formData.append("username", values.username)
            formData.append("file", values.file)

            const result = await uploadAction(formData)

            if (!result.success) {
                throw new Error(result.error || 'Upload failed')
            }

            console.log('Upload successful:', result)
            
            alert(`Upload successful! URL: ${result.url} name: ${result.username}`)
            form.reset()
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
                setImagePreview(null)
            }

        } catch (error) {
            console.error('Upload error:', error)
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Image</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                            </FormControl>
                            <FormMessage />
                            {imagePreview && (
                                <div className="mt-4">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="max-w-xs rounded"
                                    />
                                </div>
                            )}
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Submit'}
                </Button>
            </form>
        </Form>
    )
}

export default UploadForm