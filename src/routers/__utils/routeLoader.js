const fs = require("fs");
const path = require("path");
const RouteCollector = require("../../utils/routeCollector");

/**
 * 递归加载路由文件
 * @param {string} dir - 要加载的目录路径
 * @param {object} router - Express路由实例
 * @param {string} basePrefix - 基础路由前缀
 */
function loadRoutesRecursively(dir, router, basePrefix = '') {
  try {
    // 检查当前目录是否以 双下滑下 （__） 开头，如果是则跳过整个目录
    const currentDir = path.basename(dir);
    if (currentDir.startsWith('__')) {
      return;
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    // 检查当前路径是否位文件夹 isDirectory 如果不是文件夹 则是文件 则处理路由文件
    items
      .filter(item => !item.isDirectory() && item.name.endsWith('.routes.js'))
      .forEach(file => {
        const routePath = path.join(dir, file.name);
        loadRouteFile(routePath, router, dir, basePrefix);
      });

    // 递归处理子目录
    items
      .filter(item => item.isDirectory() && !item.name.startsWith('__'))
      .forEach(dirent => {
        // 使用 dirent.name 获取目录名，并与当前目录路径拼接
        const subDir = path.join(dir, dirent.name);
        loadRoutesRecursively(subDir, router, basePrefix);
      });
  } catch (error) {
    console.error(`❌ 加载目录失败: ${dir}`, error);
    throw error;
  }
}

/**
 * 加载单个路由文件
 */
function loadRouteFile(routePath, router, dir, basePrefix) {
  try {
    const moduleRouter = require(routePath);

    if (!moduleRouter || !moduleRouter.stack) {
      throw new Error(`${routePath} 不是有效的路由模块`);
    }

    // 获取不包含下划线文件夹的路由前缀
    const routePrefix = getRoutePath(dir);
    const finalPrefix = routePrefix ? basePrefix + '/' + routePrefix : basePrefix;
    // 收集路由信息
    moduleRouter.stack.forEach(layer => {
      if (layer.route) {
        const route = layer.route;
        const routePath = route.path;
        Object.keys(route.methods).forEach(method => {
          if (route.methods[method]) {
            RouteCollector.addRoute(method, routePath, finalPrefix);
          }
        });
      }
    });

    // 注册路由
    router.use(finalPrefix, moduleRouter);
    console.log(`✅ 已加载路由:  -> ${finalPrefix}      所在文件位置： ${getRelativePathFromSrc(routePath)}`);
  } catch (error) {
    console.error(`❌ 加载路由文件失败: ${getRelativePathFromSrc(routePath)}`, error);
    throw error;
  }
}

/**
 * 处理路由路径，跳过带下划线的文件夹
 */
function getRoutePath(dir) {
  const modulesDir = path.join(process.cwd(), 'src/modules');
  const relativePath = path.relative(modulesDir, dir);

  // 将路径分割成段，过滤掉带下划线的文件夹名
  const pathSegments = relativePath.split(path.sep)
    .filter(segment => !segment.includes('_'));

  return pathSegments.join('/');
}

/**
 * 获取从src开始的相对路径
 */
function getRelativePathFromSrc(fullPath) {
  const srcIndex = fullPath.indexOf('src');
  return srcIndex !== -1 ? fullPath.slice(srcIndex) : fullPath;
}

module.exports = loadRoutesRecursively; 