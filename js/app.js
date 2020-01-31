jQuery(window).on('load', function () {
  console.log('testing')
  if (window.location.origin.includes('chrome-extension')) {
    chrome.storage.local.get(['shopeeData'], (result) => {
      if (result.shopeeData) {
        // console.log(result.shopeeData)
        $('#kt_subheader_total').text(`${JSON.stringify(result.shopeeData.totalItemsData.length)} Total`)
        let totalItemsData = result.shopeeData.totalItemsData
        let shopAccount = result.shopeeData.shopAccount
        let shopeeIndex = {
          init: () => {
            let e, t;
            e = result.shopeeData.totalItemsData,
              t = $(".kt-datatable").KTDatatable({
                data: {
                  type: "local",
                  source: e,
                  pageSize: 10
                },
                layout: {
                  scroll: !1,
                  footer: !1
                },
                sortable: !0,
                pagination: !0,
                search: {
                  input: $("#generalSearch")
                },
                columns: [
                  {
                    field: "itemid",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Item ID">Item ID</span>`,
                  }, {
                    field: "name",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Name">Name</span>`,
                  }, {
                    field: "image",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Image">Image</span>`,
                    sortable: !0,
                    template: (e) => {
                      return `<img class="img-fluid" src="https://cf.shopee.vn/file/${e.image}" />`
                    }
                    // }, {
                    //   field: "price_max",
                    //   title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Price Max">Price Max</span>`,
                    //   width: 80,
                    //   autoHide: !0,
                    //   template: e => `${(e.price_max / 100000).toLocaleString()}`
                  }, {
                    field: "price_before_discount",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Price Before Discount">Price Before Discount</span>`,
                    width: 80,
                    autoHide: !0,
                    template: e => `${(e.price_before_discount / 100000).toLocaleString()}`
                    // }, {
                    //   field: "price_min",
                    //   title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Price Min">Price Min</span>`,
                    //   width: 80,
                    //   autoHide: !0,
                    //   template: e => `${(e.price_min / 100000).toLocaleString()}`
                  }, {
                    field: "price",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Price">Price</span>`,
                    width: 80,
                    template: e => `${(e.price / 100000).toLocaleString()}`
                  }, {
                    field: "item_status",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Status">Status</span>`,
                    width: 80,
                    template: e => {
                      return `${e.item_status == 'normal' ? '<span class="kt-badge kt-badge--success kt-badge--dot"></span>&nbsp;<span class="kt-font-bold kt-font-success">' + e.item_status + '</span>' : '<span class="kt-badge kt-badge--danger kt-badge--dot"></span>&nbsp;<span class="kt-font-bold kt-font-danger">' + e.item_status + '</span>'}`
                    }
                  }, {
                    field: "description",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Description">Description</span>`,
                    width: 200,
                    overflow: "hidden",
                    sortable: !0,
                    template: e => `<textarea class="form-control" readonly rows="5" style="white-space:pre-line">${e.description}</textarea>`
                  }, {
                    field: "item_rating",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Item Rating">Item Rating</span>`,
                    width: 60,
                    template: e => `${e.item_rating.rating_star.toFixed(2)}`
                  }, {
                    field: "historical_sold",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Historical Sold">Historical Sold</span>`,
                    width: 60
                  }, {
                    field: "sold",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Monthly Sold">Monthly Sold</span>`,
                    width: 60
                  }, {
                    field: "liked_count",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Liked Count">Liked Count</span>`,
                    width: 60
                  }, {
                    field: "shopee_verified",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Shopee Verified">Shopee Verified</span>`,
                    width: 80,
                    template: e => {
                      return `${e.shopee_verified == !0 ? '<span class="kt-badge kt-badge--success kt-badge--dot"></span>&nbsp;<span class="kt-font-bold kt-font-success">True</span>' : '<span class="kt-badge kt-badge--danger kt-badge--dot"></span>&nbsp;<span class="kt-font-bold kt-font-danger">False</span>'}`
                    }
                  }, {
                    field: "ctime",
                    title: `<span data-toggle="kt-tooltip" data-skin="primary"  data-placement="top" title="" data-original-title="Created At">Created At</span>`,
                    template: e => {
                      return `${timeConverter(e.ctime)}`
                    }
                  }
                ]
              }),
              $("#kt_form_status").on("change", function () {
                t.search($(this).val().toLowerCase(), "Status")
              }),
              $("#kt_form_status").selectpicker()
          }
        }
        shopeeIndex.init()
        $('[data-toggle="kt-tooltip"]').tooltip()
        let shopeeAccount = {
          init: () => {
            $('#account--image').attr('src', `https://cf.shopee.vn/file/${shopAccount.data.account.portrait}_tn`)
            $('#account--name').text(shopAccount.data.name)
            $('#account--item').text(`Total Items: ${shopAccount.data.item_count}`)
            $('#account--description').text(shopAccount.data.description)
            $('#account--rating-star').text(shopAccount.data.rating_star)
            $('#account--followers').text(shopAccount.data.follower_count)
            $('#account--revenue-all').text(`${(totalItemsData.reduce((x, y) => x + y.price * y.historical_sold, 0) / 100000).toLocaleString()} VND`)
            $('#account--revenue-month').text(`${(totalItemsData.reduce((x, y) => x + y.price * y.sold, 0) / 100000).toLocaleString()} VND`)
          }
        }
        shopeeAccount.init()
        $('body').addClass('js-loaded');
        setTimeout(() => {
          $('body').removeClass('is-loading');
        }, 3000)
      }
    })
  } else {
    //? Do Nothing
  }
})