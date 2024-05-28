const express = require("express");
const router = express.Router();
const AuthRouter = require("./routers/authRouter");
const UserRouter = require("./routers/user");
const SupplierRouter = require("./routers/supplier");
const StockRawMaterialRouter = require("./routers/stockRawMaterial");
const StockPurchaseRouter = require("./routers/stockPurchase");
const StockProductRouter = require("./routers/stockProduct");
const SalesOrderRouter = require("./routers/salesOrder");
const RawMaterialRouter = require("./routers/rawMaterial");
const ProductionOrderRouter = require("./routers/productionOrder");
const ProductRouter = require("./routers/product");
const PaymentRouter = require("./routers/payment");
const ExpencesRouter = require("./routers/expences");
const ExpenceCategoryRouter = require("./routers/expenceCategory");
const Customer = require("./routers/customer");
const Reports = require("./routers/reports");

//
//
//
//
//

router.use("/auth", AuthRouter);
router.use("/user", UserRouter);
router.use("/supplier", SupplierRouter);
router.use("/stockRawMaterial", StockRawMaterialRouter);
router.use("/stockPurchase", StockPurchaseRouter);
router.use("/stockProduct", StockProductRouter);
// router.use("/salesOrderItem", SalesOrderItemRouter);
router.use("/salesOrder", SalesOrderRouter);
router.use("/rawMaterial", RawMaterialRouter);
router.use("/productionOrder", ProductionOrderRouter);
router.use("/product", ProductRouter);
router.use("/payment", PaymentRouter);
router.use("/expences", ExpencesRouter);
router.use("/expenceCategory", ExpenceCategoryRouter);
router.use("/customer", Customer);
router.use("/reports", Reports);

module.exports = router;
