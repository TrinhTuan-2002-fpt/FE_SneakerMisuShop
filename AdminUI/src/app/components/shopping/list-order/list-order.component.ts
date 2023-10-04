import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-list-order',
  templateUrl: './list-order.component.html',
  styleUrls: ['./list-order.component.scss']
})

export class ListOrderComponent extends BaseComponent implements OnInit {

  code_search: any = '';
  from_search: any = null;
  to_search: any = null;
  selectedOption: any;
  listProductBought: any;
  isEditing: boolean = false;
  checkProductCartGreaterOne: any;

  ngOnInit(): void {
    this.getListData();
    this.getListCity();
    this.getListProduct(this.getRequestProduct());
    this.getListAllProduct();
    this.sumCart();
  }

  getRequestProduct() {
    return {
      code: this.product_code_search ?? '',
      name: this.product_name_search ?? '',
      categoryId: this.category_search ?? null,
      branchId: this.brand_search ?? null
    }
  }

  getListData() {
    var req = {
      fromDate: this.from_search,
      toDate: this.to_search,
      code: this.code_search
    }
    this.orderService.getOrderInfor(req).subscribe(
      (res: any) => {
        this.listOrderInfo = res.data.filter((c: any) => c.status == 5);
        this.listOrderInfo.filter((c: any) => c.status == 5).forEach((x: any) => {
          if (x.townId) {
            x.townId = x.townId.toString();
            this.positionService.getListDistrict({ province_id: x.cityId }).subscribe(
              (res: any) => {
                x.listDistrict = res.data;
                this.positionService.getListWard({ district_id: x.districtId }).subscribe(
                  (res: any) => {
                    x.listWard = res.data;
                  }
                );
              }
            );
          }
        });
      }
    );
  }

  selectCity(id: any) {
    this.listOrderInfo.forEach((x: any) => {
      x.id_district = '';
      x.id_ward = '';
      x.id_ward = x.id_ward.toString();
      this.positionService.getListDistrict({ province_id: id }).subscribe(
        (res: any) => {
          x.listDistrict = res.data;
          this.positionService.getListWard({ district_id: x.id_district }).subscribe(
            (res: any) => {
              x.listWard = res.data;
            }
          );
        }
      );
    });
  }

  selectDistrict(id: any) {
    this.listOrderInfo.forEach((x: any) => {
      x.id_ward = x.id_ward.toString();
      this.positionService.getListDistrict({ province_id: x.id_city }).subscribe(
        (res: any) => {
          x.listDistrict = res.data;
          this.positionService.getListWard({ district_id: id }).subscribe(
            (res: any) => {
              x.listWard = res.data;
            }
          );
        }
      );
    });
  }

  save(hd: any) {
    if (hd.status) {
      hd.status = 5
    } else {
      hd.status = 3
    }
    this.orderService.createOrderInfor(hd).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công');
        }
        else {
          this.toastr.error('Thất bại');
        }
      }
    )
  }

  // handleOk(): void {
  //   this.saveItem();
  //   this.isDisplay = false;
  // }

  handleCancel(): void {
    this.isDisplay = false;
  }

  sumCart() {
    this.total = 0;
    this.listProductCart.forEach((data: any) => {
      this.total += data.price * data.amountCart;
    });
  }


  _order: any;
  orderCode: any;
  statusOrder: any;

  showDetail(hd: any) {
    this.orderCode = null;
    this.statusOrder = null;
    this._order = hd;
    this.orderCode = hd.code;
    this.statusOrder = hd.status;
    this.getListProduct(this.getRequestProduct());
    this.getAttribute();
    this.isDisplay = true;
    this.listProductCart = JSON.parse(hd.orderItem);
    this.listProductCart.forEach(
      (x: any) => {
        x.amountBought = x.amountCart > 0 ? x.amountCart : 0;
      }
    );
    this.listProductBought = this.listProductCart;
    this.total = 0;
    this.sumCart();
    this.selected_ID = hd.id;
    this.status_order = hd.status;
    this.checkProductCartGreaterOne =  this.listProductCart.length > 1;
  }

  changeSum(data: any) {
    this.cart = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('CartItem'))));
    var cart = this.cart?.filter((l: any)=> l.id === data.id && l.orderCode == this.orderCode && l.status == this.statusOrder)[0];
    var cartInput = data.amountCart - cart?.amountCart;
    var req = {
      id: data.id,
      amountCart: cartInput,
    }
    this.productService.minusAmount(req).subscribe(
      (res) => {
        if (res.status == 200) {
          this.toastr.success('Thành công');
          this.sumCart();
          this.changeCartItemInfo();
          this.getAttribute();
          this.cart = this.cart?.filter((l: any)=> l.id !== data.id || l.orderCode !== this.orderCode);
          var cartItem = {
            id: data.id,
            amount: data.amount,
            amountCart: data.amountCart,
            orderCode: this.orderCode,
            status: this.statusOrder,
          }
          this.cart.push(cartItem);

          localStorage.setItem('CartItem', JSON.stringify(this.cart));
        }
        else {
          this.toastr.warning('Số lượng sản phẩm cần mua đã vượt quá số lượng trong kho');
          data.amountCart = 1;
          //this.calculator(data);
        }
      }
    );
  }

  calculator(pro: any) {
    this.getProductDetailById(pro.id)
    let p = this.listAttribute.filter((x: any) => x.id == pro.id)[0];
   // this.listAttribute.filter((x: any) => x.id == pro.id)[0].amount = p.amount - pro.amountCart + pro.amountBought;
    this.getProductDetailByDetailId.amount = p.amount - pro.amountCart + pro.amountBought;
    // this.productService.getListAll().subscribe(
    //   (res) => {
    //     debugger
    //      res.data.filter((x: any) => x.product_attribue_id == pro.product_attribue_id)[0];
    //     this.listAllProduct.filter((x: any) => x.product_attribue_id == pro.product_attribue_id)[0].amount = p.amount - pro.amountCart + pro.amountBought;
    //   });
    this.sumCart();
  }

  showDeleteConfirm(hd: any): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn xóa hóa đơn này?',
      nzContent: '<b style="color: red;">Hóa đơn ' + hd.order_code + '</b>',
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.orderService.deleteOrderInfor(hd.order_id).subscribe(
          (res: any) => {
            if (res.status == 200) {
              this.toastr.success('Thành công');
              this.getListData();
            }
            else {
              this.toastr.error('Thất bại');
            }
          }
        );
      },
      nzCancelText: 'Đóng',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  showCancleConfirm(hd: any): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn hủy hóa đơn này?',
      nzContent: '<b style="color: red;">Hóa đơn ' + hd.code + '</b>',
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.orderService.cancleOrderInfo(hd.id).subscribe(
          (res: any) => {
            if (res.status == 200) {
              this.toastr.success('Thành công');
              this.getListData();
              this.cart = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('CartItem'))));
              this.cart = this.cart?.filter((l: any)=> l.orderCode != this.orderCode);
              localStorage.setItem('CartItem', JSON.stringify(this.cart));
            }
            else {
              this.toastr.error('Thất bại');
            }
          }
        );
      },
      nzCancelText: 'Đóng',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  showConfirmDeleteItem(product: any): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc muốn xóa sản phẩm này?',
      nzContent: `<b style="color: red;">${product.sku} - ${product.productName}</b>`,
      nzOkText: 'Xác nhận',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.listProductCart = this.listProductCart.filter((x: any) => x.id != product.id);
        product.checked = false;
        //this.checkProductCart(product.id);
        this.listAttribute.filter((x: any) => x.id == product.id)[0].amount += product.amountCart;
        this.sumCart();
        this.changeCartInfo();
        this.getAttribute();
        this.checkProductCartGreaterOne =  this.listProductCart.length > 1;
        this.cart = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('CartItem'))));
        this.cart = this.cart?.filter((l: any)=> l.id !== product.id || l.orderCode !== this.orderCode);
        localStorage.setItem('CartItem', JSON.stringify(this.cart));
      },
      nzCancelText: 'Đóng',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  addToCart(): boolean {
    var p = this.listAttribute.filter((x: any) => x.sku == this.product_code)[0];
    p.amountCart = 1;
    if (this.listProductCart.filter((x: any) => x.sku == p.sku).length > 0) {
      this.toastr.warning('Sản phẩm này đã được thêm vào giỏ hàng !');
    }
    else {
      this.listProductCart.push(p);
      var cartItem = {
        id: p.id,
        amount: p.amount,
        amountCart: p.amountCart,
        orderCode: this.orderCode,
        status: this.statusOrder,
      }
      this.cart = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('CartItem'))));
      if(this.cart == null){
        this.cart =[];
      }
      this.cart.push(cartItem);
      this.checkProductCartGreaterOne =  this.listProductCart.length > 1;
      var req = {
        id: p.id,
        amountCart: p.amountCart,
      }
      this.productService.minusAmount(req).subscribe(
        (res) => {
          if (res.status == 200) {
            this.toastr.success('Thành công');
            this.getAttribute();
            this.changeCartItemInfo();
            localStorage.setItem('CartItem', JSON.stringify(this.cart));
          }
          else {
            this.toastr.error('Thất bại !');
          }
        }
      );
    }
    this.sumCart();
    return true;
  }

  changeCartInfo() {
    var req = {
      id: this.selected_ID,
      orderItem: JSON.stringify(this.listProductCart),
      total: this.total,
      listAllProduct: JSON.stringify(this.listAttribute)
    }
    this.orderService.updateItemOrderInfo(req).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công');
          this.getListData();
          this.getAttribute();
          this.sumCart();
        }
        else {
          this.toastr.error('Thất bại');
        }
      }
    );
  }

  changeCartItemInfo() {
    var req = {
      id: this.selected_ID,
      orderItem: JSON.stringify(this.listProductCart),
      total: this.total,
    }
    this.orderService.updateOrderInfoItem(req).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công');
          this.getListData();
          this.getAttribute();
          //this.sumCart();
        }
        else {
          this.toastr.error('Thất bại');
        }
      }
    );
  }

  saveItem() {
    //this.changeCartInfo();
    this.isDisplay = false;
  }

  saveOrderItem(hd: any) {
    var req = {
      id: hd.id,
      name: hd.name,
      description: hd.description,
      phone: hd.phone,
      typePayment: hd.typePayment,
      boughtType: hd.boughtType,
      total: hd.total,
      cityId: hd.cityId,
      districtId: hd.districtId,
      townId: hd.townId,
      addressDetail: hd.addressDetail,
      type: hd.type,
      status: hd.status
    }
    if(hd.status){
      req.status = 5
    }else{
      req.status = 3
    }
    this.orderService.updateOrderItem(req).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công');
          this.getListData();
          this.sumCart();
        }
        else {
          this.toastr.error('Thất bại');
        }
      }
    );
    this.isDisplay = false;
  }

  changeAmount(p: any) {
    if (!p.checked) {
      this.listProductCart = this.listProductCart.filter((x: any) => x.id != p.id);
      this.total -= p.totalPayment;
    }
    else {
      //var pAmount = this.listProductBought.filter((x: any) => x.id == p.id)[0];
      //p.amountCart = pAmount?.amountBought ? pAmount.amountBought : 1;
      p.amountCart = 1;
      // p.amountBought = pAmount?.amountBought ? pAmount.amountBought : 0;
      p.amountBought = 0;
      // p.totalPayment = 0;
      p.totalPayment = (p.price * p.amountCart);
      this.total += p.totalPayment;
      this.listProductCart.push(p);
      //this.listAttribute.filter((x: any) => x.id == p.id)[0].amount -= p.amountCart;
      this.checkProductCartGreaterOne =  this.listProductCart.length > 1;
      var cartItem = {
        id: p.id,
        amount: p.amount,
        amountCart: p.amountCart,
        orderCode: this.orderCode,
        status: this.statusOrder,
      }
      this.cart = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('CartItem'))));
      if(this.cart == null){
        this.cart =[];
      }
      this.cart.push(cartItem);

      localStorage.setItem('CartItem', JSON.stringify(this.cart));

      var req = {
        id: p.id,
        amountCart: p.amountCart,
      }
      this.productService.minusAmount(req).subscribe(
        (res) => {
          if (res.status == 200) {
            this.toastr.success('Thành công');
            this.getAttribute();
            this.sumCart();
            this.changeCartItemInfo();
          }
          else {
            this.toastr.error('Thất bại !');
          }
        }
      );

      //this.changeCartInfo();
    }
  }

  checkProductCart(id: any) {
    if (this.listProductCart.map((x: any) => x.id).includes(id)) {
      return false;
    }
    return true;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }
  
  checkAmountEvent(event: any, index: any) {
    const inputValue = event.target.value;
    this.listProductCart[index].value = inputValue;
    if(inputValue <= 0) this.toastr.warning('Số lượng không được nhỏ hơn hoặc bằng 0 !');

    if (inputValue >  this.listProductCart[index].amount) {
      this.toastr.warning('Số lượng bạn chọn lớn hơn số lượng trong kho!');
      this.listProductCart[index].amountCart = 1
    }
  }

}
