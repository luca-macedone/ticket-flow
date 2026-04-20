import bcript from "bcrypt";
import { Request, Response, Router } from "express";
import { prisma } from "../db";
import { signAccessToken } from "../auth/jwt";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcript.compare(password, user.pswHash);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "APPROVED") {
        return res.status(403).json({ message: "User not approved yet" })
    }

    const accessToken = signAccessToken({
        userId: user.id.toString(),
        role: user.role
    })

    res.json({ accessToken });
})

export default router;