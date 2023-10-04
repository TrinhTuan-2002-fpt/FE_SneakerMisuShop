import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-create-new',
  templateUrl: './create-new.component.html',
  styleUrls: ['./create-new.component.scss']
})
export class CreateNewComponent extends BaseComponent implements OnInit {

  index = 0;
  tabs = [
    {
      name: 'Hóa đơn 1',
    }
  ];
  selectedOption: any;
  waitingPayment: any;
  paymentMethod: any;
  listDistrictFilter: any;
  listWardFilter: any;
  totalPayment: any = 0;
  full_name: string = '';
  accountId: any;
  bought_type: any;

  voucherCode: any;
  closeTab({ index }: { index: number }): void {
    this.tabs.splice(index, 1);
  }

  newTab(): void {
    if (this.tabs.length > 4) {
      this.toastr.warning('Bạn chỉ được tạo tối đa 5 hóa đơn');
    }
    else {
      let tab = {
        name: 'Hóa đơn ' + (this.tabs.length + 1),
      };
      this.tabs.push(
        tab
      );
       this.refreshOrderInfo();
      this.orderInfo.code = `HD_${Math.floor(Math.random() * (99999999 - 10000000)) + 10000000}`;
      this.index = this.tabs.length - 1;
    }
  }

  resetOrder(){
    //this.refreshOrderInfo();
    this.orderInfo.code = `HD_${Math.floor(Math.random() * (99999999 - 10000000)) + 10000000}`;
    //this.listProductCart = [];
    //this.totalPayment = 0;
  }

  ngOnInit(): void {
    this.getListCity();
    this.getListProduct(this.getRequestProduct());
    this.getListAccount(this.getRequestAccount());
    this.refreshOrderInfo();
    this.getListAllProduct();
    this.getAttribute();
    this.getListSize();
    this.getListColor();
    this.orderInfo.bought_type = 'offline';
    this.orderInfo.code = `HD_${Math.floor(Math.random() * (99999999 - 10000000)) + 10000000}`;
    const data = localStorage.getItem('UserInfo');
    if (data) {
      const account = JSON.parse(data);
      this.full_name = account.name;
      this.accountId = account.id;
    }
  }
  getRequestProduct() {
    return {
      code: this.product_code_search ?? '',
      name: this.product_name_search ?? '',
      categoryId: this.category_search ?? null,
      branchId: this.brand_search ?? null
    }
  }

  getRequestAccount() {
    return {
      Username: this.user_name_search,
      Phone: this.phone_search,
      Name: this.full_name_search,
      Email: this.email_search
    }
  }

  selectCity() {
    this.getListDistrict({ province_id: this.citySelected });
    this.orderInfo.id_city = this.citySelected;
  }

  selectDistrict() {
    this.getListWard({ district_id: this.districtSelected });
    this.orderInfo.id_district = this.districtSelected;
  }

  selectWard() {
    this.orderInfo.id_ward = this.townSelected;
  }

  addToCart(): boolean {
    //this.productFilter = this.listAllProduct;
    if( this.product_code || (this.product_code || this.product_name && this.size_search && this.colorInput)){
      this.productDetailFilter = this.listAttribute;
      if (this.product_code) {
        this.productDetailFilter = this.productDetailFilter.filter((x: any) => x.sku == this.product_code);
      }
      if (this.product_name) {
        this.productDetailFilter = this.productDetailFilter.filter((x: any) => x.productName.toLowerCase().includes(this.product_name.toLowerCase()));
      }
      if (this.size_search) {
        this.productDetailFilter = this.productDetailFilter.filter((x: any) => x.sizeId == this.size_search);
      }
      if (this.colorInput) {
        this.productDetailFilter = this.productDetailFilter.filter((x: any) => x.colorId == this.colorInput);
      }
      let listAttributeCartId = this.listProductCart.map((x: any) => x.id) ?? [];
  
      if(this.productDetailFilter.length > 0){
        this.productDetailFilter.forEach((att: any) => {
          if (!listAttributeCartId.includes(att.id)) {
            att.totalPayment = att.price * att.amount;
            att.checked = false;
            att.amountCart = 1;
    
            this.listProductCart.push(att);
            this.toastr.success('Thành công thêm sản phẩm');
            //this.totalPayment = this.listProductCart?.filter((x: any) => x.checked == true)?.map((o: any) => o.totalPayment)?.reduce((a: any, c: any) => { return a + c }) ?? 0;
          }
          else {
            this.toastr.warning('Bạn đã thêm mã sản phẩm ' + att.sku + ' này rồi');
          }
        })
        return true;
      }
      this.toastr.warning('Không tìm thấy sản phẩm nào phù hợp');
      return false;
    }
    this.toastr.warning('Vui lòng nhập tên sản phẩm, kích cỡ và màu sắc!');
    return false;
   
  }

  deleteCart(data: any) {
    this.listProductCart = this.listProductCart.filter((x: any) => x.id != data.id);
    if (data.checked) {
      this.totalPayment -= data.totalPayment;
    }
  }

  checkAmount(data: any) {
    if (data.amountCart > data.amount) {
      this.toastr.warning('Số lượng sản phẩm cần mua đã vượt quá số lượng trong kho');
      setTimeout(function(){
        data.amountCart = 1;
      }, 450);
      
      return;
    }
    if (data.amountCart < 1) {
      this.toastr.warning('Số lượng sản phẩm thấp nhất là 1');
      setTimeout(function(){
        data.amountCart = 1;
      }, 450);
      
      return;
    }
  }

  changeAmount(data: any) {
    data.totalPayment = data.price * data.amountCart;
    if (!data.checked) {
      this.totalPayment -= data.totalPayment;
    }
    this.totalPayment = this.listProductCart.filter((x: any) => x.checked == true).map((o: any) => o.totalPayment).reduce((a: any, c: any) => { return a + c });
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

  createOrder(): boolean {
    if (!this.listProductCart || !(this.totalPayment > 0)) {
      this.toastr.warning('Vui lòng chọn sản phẩm');
      return false;
    }

    if (this.orderInfo.name == null || this.orderInfo.name == undefined 
        || this.orderInfo.typePayment == null || this.orderInfo.typePayment == undefined
        || this.bought_type == null || this.bought_type == undefined
        ) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin !');
      return false;
    }

    if (this.orderInfo.status) {
      this.orderInfo.status = 5
    } else {
      this.orderInfo.status = 3
    }
    this.orderInfo.id = 0;
    this.orderInfo.accountId = this.accountId;
    this.orderInfo.total = this.totalPayment;
    this.orderInfo.orderItem = JSON.stringify(this.listProductCart.filter((x: any) => x.checked == true));
    this.orderInfo.boughtType = this.bought_type;
    this.orderInfo.type = 2;
    this.orderInfo.cityId = this.citySelected;
    this.orderInfo.districtId = this.districtSelected;
    this.orderInfo.townId = this.townSelected;
    this.orderInfo.voucherCode = this.voucherCode;
    
    this.listProductCart.forEach((x: any) =>{
      var cartItem = {
        id: x.id,
        amount: x.amount,
        amountCart: x.amountCart,
        orderCode: this.orderInfo.code,
        status: this.orderInfo.status
      }
      this.cart = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('CartItem'))));
      if(this.cart == null){
        this.cart =[];
      }
      this.cart.push(cartItem);
      localStorage.setItem('CartItem', JSON.stringify(this.cart));
    })
   

    this.orderService.createOrderInfor(this.orderInfo).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công !');
          this.refreshOrderInfo();
          this.orderInfo.code = `HD${Math.floor(Math.random() * (99999999 - 10000000)) + 10000000}`;
          this.listProductCart = [];
          this.totalPayment = 0;
        }
        else {
          this.toastr.warning('Thất bại !');
        }
      }
    );
    return true;
  }

  voucher: boolean = false;
  addVoucher(): void{
    var req = {
      code: this.voucherCode,
      minimumAmount: this.totalPayment
    }
    this.voucherService.minusQuantity(req).subscribe(res => {
      if(res.data?.minimumAmount <  this.totalPayment && res.data?.status == 1){
        if(res.data.value == 1){
          this.totalPayment = this.totalPayment - (this.totalPayment * (res.data?.percentPrice / 100));
        }else{
          this.totalPayment = this.totalPayment - res.data.percentPrice;
        }
        this.toastr.success('Thêm mã giảm giá thành công !');
        this.voucher = true;
      }else{
        this.voucherService.getList({code: null, effectiveDate: null, expiredDate: null}).subscribe((res => {
          res.data.filter((c: any)=>c.code == this.voucherCode);
          this.toastr.warning(`Mã giảm giá không được áp dụng (Số tiền tối thiểu phải > ${res.data[0]?.minimumAmount}) !`);
        }))
      }
    });
  }
}
