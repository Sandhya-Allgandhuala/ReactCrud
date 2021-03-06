﻿using CRUDReact.Models;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;

namespace CRUDReact.Controllers
{
    public class StoreController : Controller
    {
        // GET: Store
        public ActionResult Index()
        {
            return View();
        }

        //fetch data from database
        [HttpGet]
        public JsonResult GetStoreData()
        {
            using (TransactionEntities db = new TransactionEntities())
            {
                var stores = db.Stores.ToList();
                var storesRecord = stores.Select(x => new { x.Id, x.Name, x.Address });
                return Json(storesRecord, JsonRequestBehavior.AllowGet);

            }
        }

        //Add record to database
        [HttpPost]
        public JsonResult SaveStoreData(Store store)
        {
            try
            {
                using (TransactionEntities db = new TransactionEntities())
                {
                    db.Stores.Add(store);
                    db.SaveChanges();
                    return Json(new { success = true, data = store });
                }
            }
            catch
            {
                return Json(new { success = false, message = "Invalid store given" });
            }

        }
        //Update Record in Database.
        [HttpPut]
        public JsonResult UpdateStoreData(Store store)
        {
            using (TransactionEntities db = new TransactionEntities())
            {
                if (ModelState.IsValid)
                {
                    try
                    {
                        db.Entry(store).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        var result = db.Stores.SingleOrDefault(a => a.Id == store.Id);
                        if (result == null)
                        {
                            return Json(new { success = false, message = "Cannot find store to update" }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            throw;
                        }
                    }

                    return Json(new { success = true }, JsonRequestBehavior.AllowGet);
                }
            }

            return Json(new { success = false, message = "Invalid store given" }, JsonRequestBehavior.AllowGet);
        }

        //Delete record from database
        public JsonResult DeleteStoreData(int id)
        {
            try
            {
                using (TransactionEntities db = new TransactionEntities())
                {
                    Store store = db.Stores.Find(id);
                    db.Stores.Remove(store);
                    db.SaveChanges();
                    return Json(new { success = true }, JsonRequestBehavior.AllowGet);
                }
            }
            catch
            {
                return Json(new { success = false, message = "Cannot delete Store" }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}
