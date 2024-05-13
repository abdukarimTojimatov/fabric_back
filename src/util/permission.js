const { ErrorHandler } = require("./error");
const RolePermissions = require("../config/permission-config");

module.exports = (resource, allowed) => {
  const isAllowed = function (roleData) {
    return (
      roleData
        ?.find((r) => r.resource == resource)
        ?.permissions?.some((p) => allowed?.indexOf(p) > -1) ?? false
    );
  };

  return function (req, res, next) {
    const userRole = req?.user?.role ?? null;

    if (!!userRole) {
      const roleData = RolePermissions[userRole] || [];

      if (isAllowed(roleData)) {
        return next();
      } else {
        return next(new ErrorHandler(402, "Permission denied"));
      }
    } else {
      return next(new ErrorHandler(403, "Forbidden"));
    }
  };
};
