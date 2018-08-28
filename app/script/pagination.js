function once(fn) {
  let called = false
  return function (...args) {
    if (called) return
    called = true
    return fn.apply(this, args)
  }
}

function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

function addClass(el, cls) {
  if (!el) return
  let curClass = el.className
  let classes = (cls || '').split(' ')

  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

function removeClass(el, cls) {
  if (!el || !cls) return
  let classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '

  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

function Pagination(data) {
  this.options = Object.assign({
    currentPage: 1,
    el: 'body',
    pageStep: 5,
    pageCount: 1,
    hasToPage: true,
    prevText: '«',
    nextText: '»'
  }, data)
  let el = this.options.el
  this.$el = typeof el == 'string' ? document.querySelector(el) : el
  this.showPrevMore = false
  this.showNextMore = false
  this.quicknextIconClass = 'juke-icon-more'
  this.quickprevIconClass = 'juke-icon-more'
  this.pagers = []
  this.events = []
  this.pageNum = 1
  this.init()
}

Pagination.prototype.init = function() {
  if (!this.$el) {
    throw new Error('pagination should have exist wrapper dom')
  }
  this.renderPager()
}

Pagination.prototype.refresh = function(data) {
  this.options = Object.assign(this.options, data)
  this.init()
}

Pagination.prototype.bindEvents = function() {
  this.$el.addEventListener('click', (e) => {
    let evtTarget = e.target
    let quickStep = this.options.quickStep
    let pageIndex
    if (hasClass(evtTarget, 'confirm-btn')) {
      pageIndex = document.querySelector('#page-input').value
    }
    if (hasClass(evtTarget, 'disabled')) {
      return
    }
    if (hasClass(evtTarget, 'number')) {
      pageIndex = evtTarget.getAttribute('data-page')
      if (pageIndex == this.options.currentPage) {
        return
      }
    }

    if (hasClass(evtTarget, 'prev-page')) {
      pageIndex = this.options.currentPage - 1
    }
    if (hasClass(evtTarget, 'next-page')) {
      pageIndex = this.options.currentPage + 1
    }

    if (hasClass(evtTarget, 'btn-quickprev')) {
      pageIndex = this.options.currentPage - quickStep || 1
    }
    if (hasClass(evtTarget, 'btn-quicknext')) {
      pageIndex = Math.min(this.options.currentPage + quickStep, this.options.pageCount)
    }
    pageIndex && this.trigger('changePage', pageIndex)
  })
}

Pagination.prototype.bindQuickBtnEvents = function() {
  let quickprevBtn = document.querySelector('.quick-prev-btn')
  let quicknextBtn = document.querySelector('.quick-next-btn')

  quickprevBtn.addEventListener('mouseenter', () => {
    addClass(quickprevBtn, 'juke-icon-d-arrow-left')
  })
  quickprevBtn.addEventListener('mouseleave', () => {
    removeClass(quickprevBtn, 'juke-icon-d-arrow-left')
  })

  quicknextBtn.addEventListener('mouseenter', () => {
    addClass(quicknextBtn, 'juke-icon-d-arrow-right')
  })
  quicknextBtn.addEventListener('mouseleave', () => {
    removeClass(quicknextBtn, 'juke-icon-d-arrow-right')
  })
}

Pagination.prototype.bindInput = function() {
  let pageInput = document.querySelector('#page-input')
  pageInput.value = this.options.currentPage
  pageInput.addEventListener('change', (e) => {
    if (e.target.value > this.options.pageCount) {
      e.target.value = this.options.pageCount
    }
  })
  pageInput.addEventListener('keyup', (e) => {
    if (e.keyCode == 13) {
      this.trigger('changePage', pageInput.value)
    }
  })
}

Pagination.prototype.renderPager = function() {
  this.generatePagers()
  
  let currentPage = this.options.currentPage
  let pagerList = this.pagers.map(page => `<li class="juke-number number ${currentPage == page ? 'active' : ''}" data-page="${page}">${page}</li>`)
  let pageStep = this.options.pageStep
  let pageCount = this.options.pageCount
  let pagerTemp = `<ul class="juke-pager pager-wrapper ${!pageCount ? 'hide' : ''}" >
                      <li class="prev-page ${currentPage == 1 ? 'disabled' : ''}" title="上一页">${this.options.prevText}</li>
                      <li class="juke-number number ${currentPage == 1 ? 'active' : ''}" data-page="1" title="第1页">1</li>
                      <li class="more btn-quickprev quick-prev-btn juke-icon-more ${!this.showPrevMore ? 'hide' : ''}" title="上${pageStep}页"></li>
                      ${pagerList}
                      <li class="more btn-quicknext quick-next-btn juke-icon-more ${!this.showNextMore ? 'hide' : ''}" title="下${pageStep}页"></li>
                      <li class="juke-number number ${!pageCount ? 'hide' : ''}  ${currentPage == pageCount ? 'active' : ''}" data-page="${pageCount}">${pageCount}</li>
                      <li class="next-page ${currentPage == pageCount ? 'disabled' : ''}" title="下一页">${this.options.nextText}</li>
                      <span class="to-page ${!this.options.hasToPage ? 'hide' : ''}"> 
                        共有${pageCount} 页 到 
                        <input type="number" value="1" min="1" max="${pageCount}" class="page-input serch-input juke-text-xs line-h" id="page-input"> 
                        页, <span class="confirm-btn"/ > 确定</span>
                      </span>
                    </ul >`
  this.$el.innerHTML = pagerTemp

  this.bindQuickBtnEvents()
  if (this.options.hasToPage) {
    this.bindInput()
  }
  if (!this.bindEventsOnce) {
    this.bindEventsOnce = once(this.bindEvents)
    this.bindEventsOnce.apply(this)
  }
}

Pagination.prototype.generatePagers = function() {
  const pagerCount = 7
  const currentPage = Number(this.options.currentPage)
  const pageCount = Number(this.options.pageCount)
  let showPrevMore = false
  let showNextMore = false
  if (pageCount > pagerCount) {
    if (currentPage > pagerCount - 3) {
      showPrevMore = true
    }
    if (currentPage < pageCount - 3) {
      showNextMore = true
    }
  }

  const array = []
  if (showPrevMore && !showNextMore) {
    const startPage = pageCount - (pagerCount - 2)
    for (let i = startPage; i < pageCount; i++) {
      array.push(i)
    }
  } else if (!showPrevMore && showNextMore) {
    for (let i = 2; i < pagerCount; i++) {
      array.push(i)
    }
  } else if (showPrevMore && showNextMore) {
    const offset = Math.floor(pagerCount / 2) - 1
    for (let i = currentPage - offset; i <= currentPage + offset; i++) {
      array.push(i)
    }
  } else {
    for (let i = 2; i < pageCount; i++) {
      array.push(i)
    }
  }
  this.showPrevMore = showPrevMore
  this.showNextMore = showNextMore
  this.pagers = array
}

Pagination.prototype.on = function (eventType, fn) {
  let isEventTypeExist = this.events.map(event => event.eventType).some(item => item == eventType)
  if (!isEventTypeExist) {
    this.events.push({
      eventType,
      fn
    })
  }
}

Pagination.prototype.trigger = function (...args) {
  this.events.forEach((item) => {
    if (item.eventType === args[0]) {
      item.fn(args[1])
    }
  })
}

Pagination.prototype.off = function (eventType) {
  this.events.forEach((item, index) => {
    if (item.eventType === eventType) {
      this.events.splice(index, 1)
    }
  })
}

Pagination.prototype.once = function (eventType, fn) {
  let listener = (...args) => {
    if (fn) {
      fn.apply(this, args)
    }
    this.off(eventType)
  }
  this.on(eventType, listener)
}

export default Pagination
