const express = require("express");
const router = express.Router();
const loadRoutesRecursively = require("./__utils/routeLoader");
const apiRoutes = require("./__utils/route_apis")

// 健康检查路由
router.get("/health", (req, res) => {
    console.log("健康检查接口");
    res.json({ status: "ok", message: "服务运行正常" });
});
router.get("/apis", apiRoutes.getApis);
router.get("/api-structured", apiRoutes.getStructuredApis);
// 加载当前目录下的 不包含 __ 开头的目录 路由文件
try {
    const path = require("path");
    const autoPathDir = path.join(process.cwd(), 'src/modules');
    loadRoutesRecursively(autoPathDir, router);
} catch (error) {
    console.error("❌ 加载路由失败:", error);
    process.exit(1);
}

module.exports = router;
