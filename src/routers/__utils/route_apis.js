const express = require("express");
const router = express.Router();
const RouteCollector = require("../../utils/routeCollector");

/**
 * 获取过滤后的API列表
 */
function getFilteredRoutes(routes, { module, method, keyword }) {
  let filteredRoutes = routes;
  
  if (module) {
    filteredRoutes = filteredRoutes.filter((route) => 
      route.routerPath.startsWith(`/${module}`)
    );
  }
  
  if (method) {
    filteredRoutes = filteredRoutes.filter((route) => 
      route.method.toLowerCase() === method.toLowerCase()
    );
  }
  
  if (keyword) {
    const searchKeyword = keyword.toLowerCase();
    filteredRoutes = filteredRoutes.filter((route) => 
      route.routerPath.toLowerCase().includes(searchKeyword) || 
      route.description.toLowerCase().includes(searchKeyword)
    );
  }

  return filteredRoutes;
}

/**
 * 获取结构化的API列表
 */
function getStructuredRoutes(routes) {
  const groupedRoutes = {};

  routes.forEach((route) => {
    // 移除开头和结尾的斜杠，并分割路径
    const pathParts = route.routerPath
      .replace(/^\/|\/$/g, '')
      .split('/')
      .filter(Boolean);

    // 创建当前路径的引用
    let current = groupedRoutes;
    
    // 遍历路径的每一部分，构建嵌套结构
    pathParts.forEach((part, index) => {
      // 如果是参数路径（以:开头），放在父级的params中
      if (part.startsWith(':')) {
        if (!current.params) {
          current.params = [];
        }
        current.params.push({
          param: part.slice(1),
          method: route.method,
          path: route.routerPath,
          description: route.description
        });
        return;
      }

      // 如果是最后一个部分，添加到endpoints中
      if (index === pathParts.length - 1) {
        if (!current.endpoints) {
          current.endpoints = [];
        }
        current.endpoints.push({
          method: route.method,
          path: route.routerPath,
          description: route.description
        });
        return;
      }

      // 创建或获取子模块
      if (!current.modules) {
        current.modules = {};
      }
      if (!current.modules[part]) {
        current.modules[part] = {
          name: part,
          description: `${part} 模块`
        };
      }
      current = current.modules[part];
    });
  });

  return groupedRoutes;
}

// API路由处理器
const apiRoutes = {
  // 获取API列表
  getApis: (req, res) => {
    const routes = RouteCollector.getRoutes();
    const items = getFilteredRoutes(routes, req.query);

    res.json({ 
      code: 200,
      success: true, 
      data: {
        total: items.length,
        items,
      },
      query: req.query,
    });
  },

  // 获取结构化API列表
  getStructuredApis: (req, res) => {
    const routes = RouteCollector.getRoutes();
    const structuredRoutes = getStructuredRoutes(routes);

    res.json({
      success: true,
      data: structuredRoutes
    });
  }
};
module.exports = apiRoutes; 