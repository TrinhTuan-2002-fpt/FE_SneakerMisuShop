import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent extends BaseComponent implements OnInit {

  accountName: any;
  selectedStatus!: any;
  statusFilter: any;
  isEdit: any = false;
  checkProductCartGreaterOne: any;

  filterStatusOrder: any = [
    { status: 0, name: 'Chờ xác nhận' },
    { status: 1, name: 'Chờ lấy hàng' },
    { status: 2, name: 'Đang giao' },
    { status: 3, name: 'Hoàn thành' },
    { status: 4, name: 'Đã hủy' },
    { status: 5, name: 'Chờ thanh toán' },
  ]

  statusOrder: any = [
    { status: 1, name: 'Chờ lấy hàng' },
    { status: 2, name: 'Đang giao' },
    { status: 3, name: 'Hoàn thành' },
    { status: 4, name: 'Đã hủy' },
  ]

  ngOnInit(): void {
    this.getListProduct(this.getRequestProduct());
    // this.getListAllProduct();
    this.getListOrder(this.getRequest());
  }
  getRequestProduct() {
    return {
      code: this.product_code_search ?? '',
      name: this.product_name_search ?? '',
      categoryId: this.category_search ?? null,
      branchId: this.brand_search ?? null
    }
  }
  getRequest() {
    return {
      code: this.order_code_search ?? '',
      name: this.customer_search ?? '',
      phone: this.phone_search ?? '',
      status: this.status_search ?? null,
      typePayment: this.payment_search ?? null,
      creationTime: this.order_date_search ?? null,
      deletionTime: this.cancle_date_search ?? null
    }
  }
  checkStatus(order: any, selectedStatus: any) {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn thay đổi trạng thái ?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.orderService.updateStatus(order.id, selectedStatus.status).subscribe(
          (res) => {
            if (res.status == 200) {
              this.toastr.success('Thành công !');
              this.getListOrder(this.getRequest());
              this.handleCancel();
            }
            else {
              this.toastr.warning('Thất bại !');
            }
          }
        )
      }
    });
  }

  showConfirm(id: any): void {
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn xóa item này không?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.orderService.delete(id).subscribe(
          (res) => {
            if (res.status == 200) {
              this.toastr.success('Xóa thành công !');
              this.getListOrder(this.getRequest());
            }
            else {
              this.toastr.warning('Xóa thất bại !');
              this.getListOrder(this.getRequest());
            }
          }
        )
      }
    });
  }

  confirmStatus(order: any, status: any) {
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn cập nhật trạng thái đơn hàng này?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.orderService.updateStatus(order.id, status.status).subscribe(
          (res) => {
            if (res.status == 200) {
              this.toastr.success('Thành công !');
              this.getListOrder(this.getRequest());
            }
            else {
              this.toastr.warning('Thất bại !');
              this.getListOrder(this.getRequest());
            }
          }
        )
      }
    });
  }

  showDetail(hd: any) {
    this.isDisplay = true;
    this.orderInfo = hd;
    this.listProductCart = JSON.parse(hd.orderItem);
  }

  orderID: any;
  showEdit(hd: any) {
    this.getListSize();
    this.getListColor();
    this.getAttribute();
    this.colorInput = null;
    this.orderID = hd.id;
    this.isEdit = true;
    this.orderInfo = hd;
    this.listProductCart = JSON.parse(hd.orderItem);
    console.log(this.listProductCart)
    this.checkProductCartGreaterOne =  this.listProductCart.length > 1;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isDisplay = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isDisplay = false;
    this.isEdit = false;
  }

  sumCart() {
    this.total = 0;
    this.listProductCart.forEach((data: any) => {
      this.total += data.price * data.amountCart;
    });
  }

  updateItem() {
    if (!this.listProductCart) {
      this.toastr.warning('Bạn chưa chọn sản phẩm');
    }
    this.sumCart();
    // var req = {
    //   Order: {
    //     id: this.orderID,
    //     orderItem: JSON.stringify(this.listProductCart),
    //   },
    // }
    var req = {
      id: this.orderID,
      orderItem: JSON.stringify(this.listProductCart),
      total: this.total,
      listAllProduct: JSON.stringify(this.listAttribute)
    }
    this.orderService.updateItemOrderInfo(req).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Cập nhật thành công');
          this.getListOrder(this.getRequest());
          window.location.reload();
          this.handleCancel();
        }
        else {
          this.toastr.warning('Thất bại');
        }
      }
    );
  }

  filter() {
    var req = {
      status: this.selectedStatus,
    }
    this.productService.getOrderByFilter(req).subscribe(
      (res) => {
        this.listOrder = res.data;
      }
    );
  }

  search() {
    this.getListOrder(this.getRequest());
  }

  setDisplayEdit(order: any): boolean {
    this.selected_ID = order.id;
    if ((order.status == 3) || (order.status == 4) || (order.status == 5)) {
      return false;
    }
    return true;
  }

  addToCart(): boolean {
    this.productFilter = this.listAttribute;

    if( this.product_code || (this.product_code || this.product_name && this.size_search && this.colorInput))
    {
      if (this.product_code) {
        this.productFilter = this.productFilter.filter((x: any) => x.sku == this.product_code);
      }
      if (this.product_name) {
        this.productFilter = this.productFilter.filter((x: any) => x.productName.toLowerCase().includes(this.product_name.toLowerCase()));
      }
      if (this.size_search) {
        this.productFilter = this.productFilter.filter((x: any) => x.sizeId == this.size_search);
      }
      if (this.colorInput) {
        this.productFilter = this.productFilter.filter((x: any) => x.colorId == this.colorInput);
      }
  
      let listAttributeCartId = this.listProductCart.map((x: any) => x.id) ?? [];
  
      if (this.productFilter) {
        this.productFilter.forEach((p: any) => {
          if (!listAttributeCartId.includes(p.id)) {
            p.id,
            p.amountCart = 1;
            p.totalPayment = 0;
            p.totalPayment = (p.price * p.amountCart);
            this.listProductCart.push(p);
            this.checkProductCartGreaterOne =  this.listProductCart.length > 1;

            var req = {
              id: p.id,
              amountCart: p.amountCart,
            }
            this.productService.minusAmount(req).subscribe(
              (res) => {
                if (res.data) {
                  this.getAttribute();
                  this.sumCart();
                  this.changeCartItemInfo();
                  this.getListOrder(this.getRequest());
                  this.toastr.success('Thêm sản phẩm thành công');
                }
                else {
                  this.toastr.error('Thất bại !');
                }
              }
            );
          }
          else {
            this.toastr.warning('Sản phẩm này đã được thêm');
          }
        })
       
      }
      else {
        this.toastr.warning('Không tìm thấy sản phẩm nào phù hợp');
      }
      return true;
    }

    this.toastr.warning('Vui lòng nhập tên sản phẩm, kích cỡ và màu sắc!');
    return false;
  }

  deleteCart(data: any): void {
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn xóa sản phẩm này?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.listProductCart = this.listProductCart.filter((x: any) => x.id != data.id);
        this.checkProductCartGreaterOne =  this.listProductCart.length > 1;

        // var req = {
        //   id: this.orderID,
        //   amountCart: data.amountCart,
        // }
        // this.productService.increaseAmount(req).subscribe(
        // (res) => {
        //   if (res.status == 200) {
        //     this.toastr.success('Xóa sản phẩm thành công');
        //     this.sumCart();
        //     this.changeCartItemInfo();
        //   }
        // }
      // );
      }
    });
  }

  changeCartItemInfo() {
    var req = {
      id: this.orderID,
      orderItem: JSON.stringify(this.listProductCart),
      total: this.total,
    }
    this.orderService.updateOrderInfoItem(req).subscribe();
  }

  orderDto: any;
  changeQuantity(data: any) {
    this.orderService.getOrder(this.orderID).subscribe((res: any) => {
      this.orderDto = res.data;
      var productList = JSON.parse(res.data.orderItem);
      var productDetail = productList.filter((c:any) => c.id == data.id)[0];
      var cartInput = data.amountCart - productDetail?.amountCart;
      var req = {
        id: data.id,
        amountCart: cartInput,
      }
      this.productService.minusAmount(req).subscribe(
      (res) => {
        if (res.status == 400) {
          this.toastr.warning('Số lượng sản phẩm cần mua đã vượt quá số lượng trong kho');
          data.amountCart = productDetail?.amountCart;
        }else{
          this.toastr.success('Thay đổi số lượng thành công');
          this.sumCart();
          this.changeCartItemInfo();
        }
      }
    );
  });
    
  }
  // getAmountStock(data: any) {
  //   this.getProductDetailById(data.productDetailId);
  //   return this.getProductDetailByDetailId?.amount ?? 0;
  // }

  // checkAmount(data: any) {
  //   this.getProductDetailById(data.productDetailId);
  //   var amount = this.getProductDetailByDetailId?.amount
  //   if (amount - data.amountCart < 0) {
  //     this.toastr.warning('Số lượng sản phẩm cần mua đã vượt quá số lượng trong kho');
  //     data.amountCart = 1;
  //   }
  // }
}
