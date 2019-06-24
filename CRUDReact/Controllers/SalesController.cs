﻿using CRUDReact.Models;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;


namespace CRUDReact.Controllers
{
    public class SalesController : Controller
    {
        // GET: Sales
        public ActionResult Index()
        {
            return View();
        }
        //fetch data from database
        [HttpGet]
        public JsonResult GetSalesData()
        {
            using (TransactionModelEntities db = new TransactionModelEntities())
            {
               var st0 = db.Sales.Include("Customer").Include("Product").Include("Store").ToList();
                var data = st0.Select(x => new { x.ID,CustomerName= x.Customer.Name , ProductName= x.Product.Name,StoreName = x.Store.Name, DateSold = x.DateSold.ToString("yyyy/MM/dd")});
                return Json(data, JsonRequestBehavior.AllowGet);
                
            }
        }

        //Add record to database
        [HttpPost]
        public JsonResult SaveSalesData(Sale sale)
        {
            try
            {
                using (TransactionModelEntities db = new TransactionModelEntities())
                {
                    db.Sales.Add(sale);
                    db.SaveChanges();
                    return Json(new { success = true, JsonRequestBehavior.AllowGet});
                }
            }
            catch
            {
                return Json(new { success = false, message = "Invalid" });
            }

        }
        //Update Record in Database.
        [HttpPut]
        public JsonResult UpdateSalesData(Sale sales)
        {
            using (TransactionModelEntities db = new TransactionModelEntities())
            {
                if (ModelState.IsValid)
                {
                    try
                    {
                        db.Entry(sales).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        var result = db.Sales.SingleOrDefault(a => a.ID == sales.ID);
                        if (result == null)
                        {
                            return Json(new { success = false, message = "Cannot find customer to update" }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            throw;
                        }
                    }

                    return Json(new { success = true }, JsonRequestBehavior.AllowGet);
                }
            }

            return Json(new { success = false, message = "Invalid customer given" }, JsonRequestBehavior.AllowGet);
        }

        //Delete record from database
        public JsonResult DeleteSalesData(int id)
        {
            try
            {
                using (TransactionModelEntities db = new TransactionModelEntities())
                {
                    Sale saledata = db.Sales.Find(id);
                    db.Sales.Remove(saledata);
                    db.SaveChanges();
                    return Json(new { success = true }, JsonRequestBehavior.AllowGet);
                }
            }
            catch
            {
                return Json(new { success = false, message = "Cannot find Sales to delete" }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}