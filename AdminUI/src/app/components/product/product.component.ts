import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent extends BaseComponent implements OnInit {

  sizeSelected: any;
  SKU_code: any;
  size: NzSelectSizeType = 'default';
  multipleValue = [];
  sizeUpdate: any = '';
  newSize: any;
  newColor: any;
  selectedPrice: any = '';
  selectedBrand: any = '';
  selectedCate: any = '';
  selectedIndex: any;
  isEdit: any = false;
  productId: any;

  checkboxForm = [
    {
      id: 1,
      name: 'Female',
      check: false
    },
    {
      id: 2,
      name: 'Male',
      check: false
    },
    {
      id: 3,
      name: 'Both',
      check: false
    },
  ];

  getRequest() {
    return {
      code: this.product_code_search ?? '',
      name: this.product_name_search ?? '',
      categoryId: this.category_search ?? null,
      branchId: this.brand_search ?? null
    }
  }

  AddForm = new FormGroup({
    // amount: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]),
    brand_id: new FormControl(null, [Validators.required]),
    category_id: new FormControl(null, [Validators.required]),
    // gender: new FormControl(null),
    origin: new FormControl(null),
    // price: new FormControl(0, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]),
    product_name: new FormControl('', [Validators.required]),
    // size: new FormControl(''),
    status: new FormControl(1),
    material: new FormControl(1),
    sole: new FormControl(1),
    typeSale: new FormControl(null, [Validators.required]),
  })

  ngOnInit(): void {
    this.getListProduct(this.getRequest());
    this.getListCate();
    this.getListBrand();
    this.getProductImage();
    this.getAttribute();
    for (let i = 2; i <= 30; i++) {
      var _img = {
        img: `/assets/images/${i}.jpg`,
        checked: false
      };
      this.listIndexImage.push(_img);
    }
  }

  editProduct() {
    this.isEdit = !this.isEdit;
    this.filterAttribute();
  }

  saveChange(data: any) {
    data.id = data.id;
    console.log(data)
    this.productService.insertAttribute(data).subscribe(
      (res) => {
        if (res.status == 200) {
          this.toastr.success('Cập nhật thành công');
        }
        else {
          this.toastr.warning('Cập nhật thất bại');
        }
      }
    );
  }

  addAttribute() {
    if (!this.sizeSelected || !this.colorInput || !this.priceInput || !this.amountInput) {
      this.toastr.warning('Bạn cần nhập đầy đủ thông tin');
    }
    else {
      let req = {
        id: this.selected_ID,
        sku: 'PD_' + btoa(Math.random().toString()).slice(0, 8),
        sizeId: this.sizeSelected,
        colorId: this.colorInput,
        importPrice: this.importPriceInput,
        price: this.priceInput,
        productId: this.productId,
        amount: this.amountInput,
        status: 1
      };
      this.productService.getAllAttribute().subscribe(
        (res) => {
          this.listAllProduct = res.data;
          if (this.listAllProduct.filter((x: any) => x.sizeId == req.sizeId && x.colorId == req.colorId && x.productId == this.productId).length > 0) {
            this.toastr.warning('Sản phẩm này đã được thêm, bạn có thể sửa !');
            return false;
          }
          else {
            this.productService.insertAttribute(req).subscribe(
              (res) => {
                if (res.status == 200) {
                  this.toastr.success('Thành công');
                  this.getAttributeByProduct(this.productId);
                }
                else {
                  this.toastr.error('Thất bại');
                }
              }
            );
            return true;
          }
        }
      )
    }
  }

  showConfirm(id: any): void {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn xóa sản phẩm này không?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.productService.delete(id).subscribe(
          (res) => {
            if (res.status == 200) {
              this.toastr.success('Thành công !');
              this.getListProduct(this.getRequest());
            }
            else {
              this.toastr.warning('Thất bại !');
              this.getListProduct(this.getRequest());
            }
          }
        )
      }
    });
  }

  showConfirmAttribute(id: any): void {
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn xóa không?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.productService.deleteAttribute(id).subscribe(
          (res) => {
            if (res.status == 200) {
              this.toastr.success('Thành công !');
              this.getAttributeByProduct(this.productId);
            }
            else {
              this.toastr.error('Thất bại !');
              this.getAttributeByProduct();
            }
          }
        )
      }
    });
  }

  showAttribute(dataEdit: any): void {
    this.isEdit = false;
    //this.selected_ID = dataEdit.id;
    this.productId = dataEdit.id;
    this.isDisplayAttribute = true;
    this.productService.getImage().subscribe(
      (res) => {
        this.listImage = res.data.filter((x: any) => x.productId == dataEdit.id);
        this.listImageString = this.listImage.map((x: any) => x.name);
        this.listIndexImage.forEach((c: any) => {
          c.checked = this.listImageString.includes(c.img);
        })
      }
    )
    this.getAttributeByProduct(dataEdit.id);
    this.getListSize();
    this.getListColor();
  }

  showAddModal(title: any, dataEdit: any): void {
    this.isDisplay = true;
    this.titleModal = title;
    this.selected_ID = 0;
    if (dataEdit != null) {
      this.selected_ID = dataEdit.id;
      this.AddForm.patchValue({
        brand_id: !dataEdit ? '' : dataEdit.branchId,
        category_id: !dataEdit ? '' : dataEdit.categoryId,
        origin: !dataEdit ? '' : dataEdit.origin,
        material: !dataEdit ? '' : dataEdit.material,
        sole: !dataEdit ? '' : dataEdit.sole,
        product_name: !dataEdit ? '' : dataEdit.name,
        status: !dataEdit ? 1 : dataEdit.status,
        typeSale: !dataEdit ? null: dataEdit.typeSale
      });
      this.sizeInput = dataEdit.size ?? '';
      this.colorInput = dataEdit.color ?? '';
      this.SKU_code = dataEdit.code;
    }
    else {
      this.AddForm.reset();
      this.sizeInput = '';
      this.colorInput = '';
      this.AddForm.patchValue({
        status: 1,
      });
      this.SKU_code = 'PR_' + btoa(Math.random().toString()).slice(0, 8);
    }
  }

  listImageString: any;
  // showImageModal(id: any): void {
  //   this.isDisplayImage = true;
  // }

  // showDetailModal(): void {
  //   this.isDisplayDetail = true;
  // }

  // showColorModal(id: any): void {
  //   this.isDisplayColor = true;
  //   this.selected_ID = id;
  // }

  handleOk(): void {
    if (this.AddForm.valid) {
      var req = {
        id: this.selected_ID,
        code: this.SKU_code,
        branchId: this.AddForm.value.brand_id,
        categoryId: this.AddForm.value.category_id,
        origin: this.AddForm.value.origin,
        material: this.AddForm.value.material,
        sole: this.AddForm.value.sole,
        name: this.AddForm.value.product_name,
        status: this.AddForm.value.status,
        size: this.sizeSelected,
        color: this.colorInput,
        typeSale: this.AddForm.value?.typeSale
      }

      this.productService.save(req).subscribe(
        (res) => {
          if (res.status == 200) {
            this.toastr.success('Thành công !');
            this.handleCancel();
            this.getListProduct(this.getRequest());
          }
          else {
            this.toastr.error('Thất bại !');
          }
        }
      );
    } else {
      this.AddForm.markAllAsTouched();
      Object.values(this.AddForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onItemChange(value: any) {
    console.log(" Value is : ", value);
  }

  handleCancel(): void {
    this.modal.closeAll();
    this.getListProduct(this.getRequest());
  }

  addSize() {

    if (!this.newSize) {
      this.toastr.warning('Bạn cần nhập size');
    }
    else {
      if (this.listOfOption.filter((x: any) => x.name == this.newSize).length > 0) {
        this.toastr.warning('Kích cỡ này đã được thêm');
      }
      else {
        var response = {
          name: `${this.newSize}`,
          status: 1
        }
        this.sizeService.save(response).subscribe(res => {
          if(res){
            this.toastr.success('Thêm size thành công');
            this.getListSize();
            this.newSize = null;
            return;
          }
          this.toastr.error('Thêm size thất bại');
        });
        //this.listOfOption.push(this.newSize);
      }
    }
  }

  addColor() {
    if (!this.newColor) {
      this.toastr.warning('Bạn cần nhập màu');
    }
    else {
      if (this.listOfOptionColor.filter((x: any) => x.name == this.newColor).length > 0) {
        this.toastr.warning('Màu này đã được thêm');
      }

      var response = {
        name: this.newColor,
        status: 1
      }
      this.colorService.save(response).subscribe(res => {
        if(res){
          this.toastr.success('Thêm màu thành công');
          this.getListColor();
          this.newColor = null;
          return;
        }
        this.toastr.error('Thêm màu thất bại')
      });
    }
  }

  filter() {
    var req = {
      fitlerPrice: this.selectedPrice,
      brand_id: this.selectedBrand,
      category_id: this.selectedCate
    }
    this.productService.getByFilter(req).subscribe(
      (res) => {
        this.listProduct = res.data;
      }
    );
  }

  addProductImage() {
    let req = {
      id: this.selected_ID,
      productId: this.productId,
      listImageChecked: this.listIndexImage.filter((x: any) => x.checked == true).map((x: any) => x.img)
    }
    this.productService.saveProductImage(req).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.toastr.success('Thành công');
        }
        else {
          this.toastr.warning('Thất bại');
        }
      }
    );
  }

  search() {
    this.getListProduct(this.getRequest());
  }

  filterAttribute() {
    this.listAttribute = this.listAttributeFilter;
    
    if (this.size_search) {
      this.listAttribute = this.listAttribute.filter((x: any) => x.sizeId == this.size_search);
    }
    if (this.color_search) {
      this.listAttribute = this.listAttribute.filter((x: any) => x.colorId == this.color_search);
    }
  }
}
