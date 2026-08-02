const { z } = require('zod');

const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?.*v=|shorts\/|playlist\?.*list=)|youtu\.be\/)[a-zA-Z0-9_-]+/;

const infoSchema = z.object({
  url: z
    .string({ required_error: 'URL is required' })
    .trim()
    .min(1, 'URL cannot be empty')
    .refine((val) => YOUTUBE_URL_REGEX.test(val), {
      message: 'Must be a valid YouTube video or playlist URL',
    }),
});

const downloadSchema = z.object({
  url: z
    .string({ required_error: 'URL is required' })
    .trim()
    .min(1, 'URL cannot be empty')
    .refine((val) => YOUTUBE_URL_REGEX.test(val), {
      message: 'Must be a valid YouTube video URL',
    }),
  quality: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_+.-]+$/, 'Invalid quality string')
    .optional()
    .default('best'),
});

function resolveFormatSelector(quality) {
  if (!quality || quality === 'best') {
    return 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
  }

  if (quality === 'worst') {
    return 'worstvideo+worstaudio/worst';
  }

  if (quality === 'audio') {
    return 'bestaudio/best';
  }

  const resMatch = quality.match(/^(\d+)p$/i);
  if (resMatch) {
    const height = resMatch[1];
    return `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`;
  }

  return quality;
}

module.exports = {
  infoSchema,
  downloadSchema,
  resolveFormatSelector,
};
