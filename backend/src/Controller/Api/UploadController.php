<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/uploads')]
class UploadController extends AbstractController
{
    private const MAX_SIZE = 5 * 1024 * 1024;

    private const MAX_DIMENSION = 4096;

    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    private const TYPES = [
        'avatars' => [
            'dir' => '/uploads/avatars',
            'maxDimension' => 1024,
        ],
        'backgrounds' => [
            'dir' => '/uploads/backgrounds',
            'maxDimension' => 1920,
        ],
        'icons' => [
            'dir' => '/uploads/icons',
            'maxDimension' => 512,
        ],
    ];

    #[Route('', name: 'api_uploads', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $type = $request->query->get('type', 'avatars');

        if (!isset(self::TYPES[$type])) {
            return $this->json(['error' => 'Unknown upload type'], 422);
        }

        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');

        if (!$file) {
            return $this->json(['error' => 'No file provided'], 422);
        }

        if (!$file->isValid()) {
            return $this->json(['error' => 'Invalid file'], 422);
        }

        if ($file->getSize() > self::MAX_SIZE) {
            return $this->json(['error' => 'File too large (5 MB max)'], 422);
        }

        $mimeType = $this->detectMimeType($file);
        if ($mimeType === null || !isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
            return $this->json(['error' => 'Image type not allowed'], 422);
        }

        $extension = self::ALLOWED_MIME_TYPES[$mimeType];

        if (!$this->isWithinMaxDimension($file)) {
            return $this->json(['error' => 'Image too large (4096 px max per side)'], 422);
        }

        $config = self::TYPES[$type];
        $targetDir = $this->getParameter('kernel.project_dir') . '/public' . $config['dir'];
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0775, true);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        $file->move($targetDir, $filename);

        $fullPath = $targetDir . '/' . $filename;
        $this->resizeToMax($fullPath, $mimeType, $config['maxDimension']);

        return $this->json(['url' => $config['dir'] . '/' . $filename], 201);
    }

    private function detectMimeType(UploadedFile $file): ?string
    {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo ? $finfo->file($file->getPathname()) : false;

        return $mimeType ?: null;
    }

    private function isWithinMaxDimension(UploadedFile $file): bool
    {
        $size = @getimagesize($file->getPathname());

        return $size === false
            || ($size[0] <= self::MAX_DIMENSION && $size[1] <= self::MAX_DIMENSION);
    }

    /**
     * Resizes the image in place so no side exceeds $maxDimension.
     * Does nothing if GD is unavailable, the format is unsupported, or the
     * image is already smaller.
     */
    private function resizeToMax(string $path, string $mimeType, int $maxDimension): void
    {
        if (!extension_loaded('gd')) {
            return;
        }

        $source = match ($mimeType) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            'image/gif' => null,
            default => null,
        };

        if (!$source) {
            return;
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $maxSide = max($width, $height);

        if ($maxSide <= $maxDimension) {
            imagedestroy($source);

            return;
        }

        $ratio = $maxDimension / $maxSide;
        $newWidth = (int) round($width * $ratio);
        $newHeight = (int) round($height * $ratio);

        $target = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($target, false);
        imagesavealpha($target, true);

        imagecopyresampled($target, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        $tmpPath = $path . '.resized';
        $saved = match ($mimeType) {
            'image/jpeg' => imagejpeg($target, $tmpPath, 82),
            'image/png' => imagepng($target, $tmpPath, 8),
            'image/webp' => imagewebp($target, $tmpPath, 82),
            default => false,
        };

        imagedestroy($source);
        imagedestroy($target);

        if ($saved) {
            rename($tmpPath, $path);
        } elseif (file_exists($tmpPath)) {
            @unlink($tmpPath);
        }
    }
}
