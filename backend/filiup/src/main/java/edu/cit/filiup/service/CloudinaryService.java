package edu.cit.filiup.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Uploads an image to Cloudinary
     *
     * @param file The image file to upload
     * @param folder The folder to upload the image to (e.g., "stories", "profiles")
     * @return Map containing upload results including the URL
     * @throws IOException If there's an error during upload
     */
    public Map<String, String> uploadImage(MultipartFile file, String folder) throws IOException {
        // Generate a unique public ID for the image
        String publicId = folder + "/" + UUID.randomUUID().toString();
        
        // Upload the image to Cloudinary
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", folder,
                "resource_type", "auto"
            )
        );
        
        // Extract and return relevant information
        return Map.of(
            "publicId", (String) uploadResult.get("public_id"),
            "url", (String) uploadResult.get("secure_url"),
            "format", (String) uploadResult.get("format")
        );
    }
    
    /**
     * Deletes an image from Cloudinary
     *
     * @param publicId The public ID of the image to delete
     * @return Map containing deletion results
     * @throws IOException If there's an error during deletion
     */
    public Map<String, Object> deleteImage(String publicId) throws IOException {
        return cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.emptyMap()
        );
    }
} 