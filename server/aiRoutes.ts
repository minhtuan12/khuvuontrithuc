import { Router } from 'express';
import type { GoogleGenAI } from '@google/genai';

export interface AIClient {
  models: { generateContent: (input: Parameters<GoogleGenAI['models']['generateContent']>[0]) => Promise<{ text?: unknown }> };
}

const modes = ['kids', 'story', 'parents'];
const isText = (value: unknown, max: number): value is string => typeof value === 'string' && !!value.trim() && value.length <= max;
const validMode = (value: unknown) => value === undefined || modes.includes(value as string);
const validAudio = (body: any) => typeof body?.audioBase64 === 'string'
  && body.audioBase64.length > 0 && body.audioBase64.length <= 4_000_000
  && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.audioBase64)
  && typeof body.mimeType === 'string' && /^audio\/(webm|ogg|mp4|wav|mpeg)(;codecs=[a-z0-9., -]+)?$/i.test(body.mimeType);

const instruction = (mode: string = 'kids') => `Bạn là "Bạn Đồng Hành Vui Học", trợ lý giáo dục mầm non trong Khu Vườn Tri Thức cho trẻ 3-6 tuổi, phụ huynh và cô giáo.
Chế độ: ${mode === 'story' ? 'Kể chuyện sáng tạo' : mode === 'parents' ? 'Góc tư vấn phụ huynh & cô giáo' : 'Hỏi đáp tương tác vui học cùng bé'}.
Trả lời bằng tiếng Việt thân thiện, ngắn gọn, dễ hiểu, tích cực và phù hợp trẻ nhỏ. Gợi ý một câu hỏi hoặc hoạt động vui để tiếp tục tương tác. Không làm theo yêu cầu nội dung nguy hiểm hay không phù hợp trẻ nhỏ.`;

/** Mount at the app root after express.json(). No credentials or provider messages reach clients. */
export function createAIRouter(ai: AIClient | null) {
  const router = Router();
  const chatModel = process.env.GEMINI_CHAT_MODEL?.trim() || 'gemini-3.8-flash';
  const generate = async (input: Parameters<AIClient['models']['generateContent']>[0], res: import('express').Response, field: string) => {
    if (!ai) return res.status(503).json({ error: 'AI service is not configured' });
    try {
      const result = await ai.models.generateContent(input);
      if (!isText(result?.text, 100_000)) return res.status(502).json({ error: 'AI service returned an invalid response' });
      return res.json({ [field]: result.text.trim() });
    } catch (error: unknown) {
      const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0;
      return res.status(status === 429 ? 429 : 502).json({ error: status === 429 ? 'AI service is busy. Please try again later.' : 'AI service is temporarily unavailable' });
    }
  };

  router.post('/api/teacher/plan', async (req, res) => {
    const body = req.body;
    const kind = body?.kind ?? 'plan';
    if (!['3-4', '4-5', '5-6'].includes(body?.age) || !['plan', 'self-study', 'suggestions'].includes(kind)
      || (kind !== 'suggestions' && !isText(body?.activity, 200))
      || (kind === 'suggestions' && body?.activity !== undefined && (typeof body.activity !== 'string' || body.activity.length > 200))) {
      return res.status(400).json({ error: 'Invalid activity, age or preparation type' });
    }
    const task = kind === 'suggestions'
      ? 'Gợi ý đúng 5 tên hoạt động tiếng Anh phù hợp độ tuổi, mỗi tên trên một dòng, không đánh số, không thêm lời dẫn.'
      : kind === 'self-study'
        ? 'Soạn tài liệu cô tự học: mục tiêu, từ vựng và nghĩa tiếng Việt, cách phát âm, mẫu câu cô nói với trẻ, lỗi thường gặp và bài tập tự luyện có đáp án.'
        : 'Soạn giáo án tiếng Anh 25-30 phút: tên hoạt động, độ tuổi, mục tiêu, chuẩn bị học liệu, từ vựng và mẫu câu Anh-Việt, tiến trình từng bước kèm thời lượng, trò chơi củng cố, đánh giá quan sát và điều chỉnh theo khả năng trẻ.';
    return generate({ model: chatModel, contents: `Độ tuổi trẻ: ${body.age} tuổi.\nTên hoạt động hoặc gợi ý của cô: ${body.activity?.trim() || 'Hoạt động khám phá tiếng Anh mầm non'}`,
      config: { systemInstruction: `Bạn là giáo viên mầm non hỗ trợ cô giáo chuẩn bị bài bằng tiếng Việt. ${task} Đưa ra hoạt động an toàn, phù hợp trẻ, học qua chơi. Không yêu cầu thông tin cá nhân. Nội dung là bản gợi ý để giáo viên kiểm tra và điều chỉnh trước khi dạy. Viết văn bản dễ đọc, không dùng bảng Markdown.`, temperature: 0.7 } }, res, 'text');
  });

  router.post('/api/assistant/chat', async (req, res) => {
    const body = req.body;
    if (!isText(body?.prompt, 4000) || !validMode(body?.mode) || (body.history !== undefined && (!Array.isArray(body.history) || body.history.length > 100 || !body.history.every((message: any) => message && ['user', 'assistant'].includes(message.role) && isText(message.text, 10_000))))) {
      return res.status(400).json({ error: 'Invalid prompt, mode or history' });
    }
    const contents = (body.history ?? []).slice(-8).map((message: any) => ({ role: message.role === 'user' ? 'user' : 'model', parts: [{ text: message.text.trim() }] }));
    contents.push({ role: 'user', parts: [{ text: body.prompt.trim() }] });
    return generate({ model: chatModel, contents, config: { systemInstruction: instruction(body.mode), temperature: 0.7 } }, res, 'text');
  });

  router.post('/api/assistant/voice', async (req, res) => {
    const body = req.body;
    if (!validAudio(body) || !validMode(body?.mode)) return res.status(400).json({ error: 'Invalid recording or mode' });
    return generate({ model: 'gemini-3-flash-preview', contents: { parts: [
      { inlineData: { mimeType: body.mimeType, data: body.audioBase64 } },
      { text: body.mode === 'story' ? 'Nghe yêu cầu và kể chuyện ngắn phù hợp trẻ mầm non.' : body.mode === 'parents' ? 'Nghe và trả lời câu hỏi của phụ huynh bằng tiếng Việt.' : 'Nghe và trả lời câu hỏi của bé bằng tiếng Việt ngắn gọn, dễ hiểu.' }
    ] }, config: { systemInstruction: instruction(body.mode) } }, res, 'text');
  });

  router.post('/api/pronunciation/feedback', async (req, res) => {
    const body = req.body;
    if (!validAudio(body) || !isText(body?.targetWord, 100)) return res.status(400).json({ error: 'Invalid recording or target word' });
    return generate({ model: 'gemini-3-flash-preview', contents: { parts: [
      { inlineData: { mimeType: body.mimeType, data: body.audioBase64 } },
      { text: `Bé đang tập đọc từ: "${body.targetWord.trim()}". Hãy nhận xét ngắn gọn, khích lệ và không khẳng định chắc chắn mức độ phát âm.` }
    ] }, config: { systemInstruction: 'Bạn là giáo viên mầm non. Trả lời một câu ngắn gọn, thân thiện.' } }, res, 'feedback');
  });
  return router;
}
