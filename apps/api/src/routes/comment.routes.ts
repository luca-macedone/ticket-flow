import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { addComment, deleteComment, getComments } from "../controllers/comment.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateCommentSchema } from "@packages/shared";

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireRole('CUSTOMER'), getComments);
router.post('/', requireAuth, requireRole('CUSTOMER'), zodValidate(CreateCommentSchema), addComment);
router.delete('/:commentId', requireAuth, requireRole('CUSTOMER'), deleteComment);

export default router;