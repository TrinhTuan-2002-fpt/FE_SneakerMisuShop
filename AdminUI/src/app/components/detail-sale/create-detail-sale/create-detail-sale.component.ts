import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-create-detail-sale',
  templateUrl: './create-detail-sale.component.html',
  styleUrls: ['./create-detail-sale.component.scss']
})
export class CreateDetailSaleComponent extends BaseComponent implements OnInit {

  code: any;
  effectiveDate: any;
  expiredDate: any;
  isDisplaySale: boolean = false;
  saleId: any;
  detailId: any;
  productId: any;
  isDisplayView: any;
  showListDetailBySaleId: any;

  ngOnInit(): void {
    this.getListSale(this.getRequest());
  }

  getRequest() {
    return {
     code: this.code ?? null,
     effectiveDate: this.effectiveDate ?? null,
     expiredDate: this.expiredDate ?? null
    }
    
   }

   listProductByIsChecked: any;
  onSelectChangeProduct(event: any): void{
    this.productId = event.target.value;
    this.listAttributeBySale = null;
    this.listProductAll = null;
    if(this.productId == 1){
      this.getallProduct();
    }else{
      this.getListDetailSaleBySaleId(this.saleId)
    }
  }

  showCreateUpdateDetailSaleModal(dataEdit: any): void {
    this.isDisplay = true;
    this.getListByStatus();
    this.getAttribute();
    if (dataEdit != null) {
      this.saleId = dataEdit.id;
      this.selected_ID = dataEdit.id;
      this.titleModal = 'Sửa chương trình khuyến mại' + " " + "' " + dataEdit.name + " '";

      if(dataEdit.id){
        this.getListDetailSaleBySaleId(dataEdit.id);
      } 
    }
    else {
      this.saleId = null;
      this.titleModal = 'Thêm chương trình khuyến mại';
      this.listDetailBySaleId = null;
      this.getAllAttributeBySale();
    }
  }

  showViewDetailSaleModal(data: any): void {
    this.isDisplayView = true;
    if (data != null) {
      this.saleId = data.id;
      this.titleModal = 'Xem chương trình khuyến mại' + " " + "' " + data.name + " '";
      if(data.id){
        this.detailSaleService.showGetListBySaleId(this.saleId).subscribe(
          (res) => {
            this.showListDetailBySaleId = res.data;
          }
        )
      } 
    }
   
  }

  handleCancel(): void {
    this.isDisplay = false;
    this.saleId = null
    this.isDisplayView = false;
  }

  listProductDetail : any[] = [];
  handleOk(): void {
   
    if(this.saleId != 0 && this.saleId && this.productId){
      var req;
     if(this.productId == 1){
      var listProduct = this.listProductAll.filter((x: any) => x.isChecked == true);
  
    
      listProduct.forEach((detail: any) => {
        const productDetails = this.listAttribute.filter((x: any) => x.productId == detail.id);
        const detailIds = productDetails.map((x: any) => ({detailId: x.id,}));

        this.listProductDetail.push(...detailIds);
      })

      req = {
        saleId: this.saleId,
        isProduct: true,
        detailSales: this.listProductDetail
      }
      
     }
     else{
        req = {
          saleId: this.saleId,
          isProduct: false,
          detailSales: this.listAttributeBySale
          .filter((x: any) => x.isChecked == true)
          .map((x: any) => {
            return {
              detailId: x.id,
            };
          })
        }
     }
      this.detailSaleService.save(req).subscribe(
        (res) => {
          if (res) {
            this.toastr.success('Thành công !');
            this.getallProduct();
            this.getListDetailSaleBySaleId(this.saleId);
          }
          else {
            this.toastr.error('Thất bại !');
          }
        }
      )
    }else{
      this.toastr.warning('Vui lòng chọn chương trình khuyến mại !');
    }
  }

  showConfirm(data: any): void {
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn xóa khuyến mại này không?</i>',
      nzOnOk: () => {
        var req;
        if(this.productId == 1){
          req = {
            id: 0,
            detailId: 0,
            productId: data.id
          }
        } else {
          req = {
            id: data.id,
            detailId: data.detailId,
            productId: 0
          }
        }
        this.detailSaleService.delete(req.id, req.detailId, req.productId).subscribe(
          (res) => {
            if (res.data == true) {
              this.toastr.success('Xóa thành công !');
              this.getallProduct();
              this.getListDetailSaleBySaleId(this.saleId);
            }
            else {
              this.toastr.warning('Xóa thất bại !');
              this.getListDetailSaleBySaleId(this.saleId);
            }
          }
        )
      }
    });
  }

  getallProduct(): void{
    this.productService.getListProduct().subscribe(
      (res) => {
        this.listProductAll = res.data.filter((x: any) => !x.isChecked && x.typeSale == 0);
        this.listProductByIsChecked = res.data.filter((x: any) => x.isChecked);
      })
  }
  // checkAll(value: boolean): void {
  //   this.listAttribute.forEach((item: any) => (item.isChecked = value));
  // }

  // selectAll() {

  //   this.listAttribute.forEach((item: any) => (item.isChecked = this.selectAllChecked));
  // }
  
  // selectItem(item: any, selectAll: boolean) {
  //   if (!selectAll) {
  //     this.selectAllChecked = false;
  //   }
  // }

}
