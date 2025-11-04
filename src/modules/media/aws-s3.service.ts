import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { randomUUID } from 'crypto';

export interface UploadResult {
    url: string;
    key: string;
    bucket: string;
}

@Injectable()
export class AwsS3Service {
    private s3Client: S3Client;
    private bucket: string;
    private region: string;

    constructor(private configService: ConfigService) {
        this.region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';
        
        const bucket = this.configService.get<string>('AWS_MEDIA_BUCKET');
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_KEY');

        if (!bucket) {
            throw new Error('AWS_MEDIA_BUCKET is not configured');
        }

        if (!accessKeyId || !secretAccessKey) {
            throw new Error('AWS credentials are not configured properly');
        }

        this.bucket = bucket;
        
        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    /**
     * Upload file to S3
     */
    async uploadFile(file: Express.Multer.File, folder: string = 'media'): Promise<UploadResult> {
        try {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${folder}/${randomUUID()}.${fileExtension}`;

            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucket,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    // ACL: 'public-read',
                },
            });

            await upload.done();

            const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;

            return {
                url,
                key: fileName,
                bucket: this.bucket,
            };
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new InternalServerErrorException(`Không thể upload file lên S3: ${error.message}`);
        }
    }

    /**
     * Delete file from S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new InternalServerErrorException(`Không thể xóa file từ S3: ${error.message}`);
        }
    }

    /**
     * Extract S3 key from URL
     */
    extractKeyFromUrl(url: string): string {
        try {
            // Format: https://bucket.s3.region.amazonaws.com/key
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1); // Remove leading slash
        } catch (error) {
            // If URL parsing fails, try simple extraction
            const parts = url.split('.amazonaws.com/');
            return parts.length > 1 ? parts[1] : '';
        }
    }

    /**
     * Check if URL is from our S3 bucket
     */
    isS3Url(url: string): boolean {
        return url.includes(this.bucket) && url.includes('.amazonaws.com');
    }
}
