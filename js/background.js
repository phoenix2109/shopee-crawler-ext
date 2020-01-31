'use strict'

const shopeeAPI = {
  shop: "https://shopee.vn/api/v2/shop",
  search_items: "https://shopee.vn/api/v2/search_items",
  item: "https://shopee.vn/api/v2/item"
}

const getShopByUsername = username => {
  return $.ajax({
    type: "GET",
    url: `${shopeeAPI.shop}/get?username=${username}`,
    success: (accountData) => {
      return accountData
    },
    error: (jqXHR, textStatus, errorThrown) => {
      return 0
    }
  });
}

const getShopByShopid = shopid => {
  return $.ajax({
    type: "GET",
    url: `${shopeeAPI.shop}/get?shopid=${shopid}`,
    success: (accountData) => {
      return accountData
    },
    error: (jqXHR, textStatus, errorThrown) => {
      return 0
    }
  });
}

const getShopItem = (shopid, newest = 0) => {
  return $.ajax({
    type: "GET",
    url: `${shopeeAPI.search_items}/?by=pop&limit=100&newest=${newest}&order=desc&page_type=shop&version=2&match_id=${shopid}`,
    success: (shopData) => {
      return shopData
    },
    error: (jqXHR, textStatus, errorThrown) => {
      return 0
    }
  })
}

const getShopItemMultiple = async (shopid, count) => {
  let itemsData = []
  for (let i = 0; i <= count; i++) {
    let data = await getShopItem(shopid, i * 100)
    if (data)
      itemsData.push(data)
  }
  return itemsData
}

const getShopItemSoldOut = (shopid, newest = 0) => {
  return $.ajax({
    type: "GET",
    url: `${shopeeAPI.search_items}/?by=pop&limit=100&only_soldout=1&newest=${newest}&order=desc&page_type=shop&version=2&match_id=${shopid}`,
    success: (shopData) => {
      return shopData
    },
    error: (jqXHR, textStatus, errorThrown) => {
      return 0
    }
  })
}

const getShopItemSoldOutMultiple = async (shopid, count) => {
  let itemsData = []
  for (let i = 0; i <= count; i++) {
    let data = await getShopItemSoldOut(shopid, i * 100)
    if (data)
      itemsData.push(data)
  }
  return itemsData
}

const getItemData = (itemid, shopid) => {
  return $.ajax({
    type: "GET",
    url: `${shopeeAPI.item}/get?itemid=${itemid}&shopid=${shopid}`,
    success: (itemData) => {
      return itemData
    },
    error: (jqXHR, textStatus, errorThrown) => {
      return {}
    }
  })
}

const filterUrl = url => {
  const parserUrl = document.createElement('a')
  parserUrl.href = url
  const pathname = parserUrl.pathname.substring(1)
  let shop = {
    shopid: '',
    username: ''
  }
  if (pathname.match(/\-i\./g))
    shop.shopid = pathname.substring(pathname.match(/\-i\./g).index).split`.`[1]
  else {
    let pathnameArr = pathname.split`/`
    pathnameArr[0] == "shop" ? shop.shopid = pathnameArr[1] : shop.username = pathnameArr[0]
  }
  return shop
}

const checkUrl = (url) => url.includes('shopee.vn') ? true : false
chrome.browserAction.onClicked.addListener(async (tab) => {
  console.log(`This is ${tab.url}`)

  const tabUrl = tab.url
  console.log(tabUrl)
  //* Check Valid Url
  if (checkUrl(tabUrl)) {
    if (tabUrl == 'https://shopee.vn/' || tabUrl == 'https://shopee.vn') {
      alert('Please choose any product or shop before using Shopee Crawler')
    } else {
    //* Get Username/Shopid
    let shop = filterUrl(tabUrl)
    //* Get Shop Account
    const shopAccount = shop.shopid == '' ? await getShopByUsername(shop.username) : await getShopByShopid(shop.shopid)
    const count = Math.floor(shopAccount.data.item_count / 100)

    let totalItemsData = []
    //* Get Shop Existed Item
    let shopItem = await getShopItemMultiple(shopAccount.data.shopid, count)
    let shopItemId = await shopItem.reduce((x, y) => {
      x.push(...y.items.map(a => a.itemid))
      return x
    }, [])
    let itemData = await shopItemId.reduce(async (x, y) => {
      const currentData = await getItemData(y, shopAccount.data.shopid)
      if (currentData)
        (await x).push(currentData.item)
      return x
    }, [])

    //* Get Shop Sold Out Item
    let countSoldOut = Math.floor((shopAccount.data.item_count - shopItemId.length) / 100)
    let shopItemSoldOut = await getShopItemSoldOutMultiple(shopAccount.data.shopid, countSoldOut)
    let shopItemIdSoldOut = await shopItemSoldOut.reduce((x, y) => {
      x.push(...y.items.map(a => a.itemid))
      return x
    }, [])
    let itemDataSoldOut = await shopItemIdSoldOut.reduce(async (x, y) => {
      const currentData = await getItemData(y, shopAccount.data.shopid)
      if (currentData)
        (await x).push(currentData.item)
      return x
    }, [])

    //* Merge Existed And Sold Out Item
    totalItemsData.push(...itemData.concat(itemDataSoldOut))

    //* Create tab and pass data to the contentScript
    chrome.tabs.create({ url: chrome.runtime.getURL("content.html"), selected: true }, tab => {
      
      chrome.tabs.executeScript(tab.id, { file: "js/contentScript.js" }, () => {
        const lastErr = chrome.runtime.lastError
        if (lastErr)
          console.log(`tab: ${tab.id} lastErorr: ${JSON.stringify(lastErr)}`)
        chrome.tabs.sendMessage(tab.id, {
          data: {
            shopAccount: shopAccount,
            totalItemsData: totalItemsData
          }
        })
      })
    })
    }
    
  } else {
    alert('This extension only uses for Shopee.vn')
  }
});


// chrome.runtime.onMessage.addListener(function(req, sender) {
//   chrome.storage.local.set({'address': req.address})
//   console.log(req.address)
//   chrome.browserAction.show(sender.tab.id);
//   chrome.browserAction.setTitle({tabId: sender.tab.id, title: req.address});
// });