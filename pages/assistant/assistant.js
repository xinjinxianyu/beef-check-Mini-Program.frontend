const ai = require('../../services/ai')
const storage = require('../../services/storage')
const history = require('../../services/history')

function safeDecode(value) {
  try {
    return decodeURIComponent(value || '')
  } catch (error) {
    return value || ''
  }
}

function getQuestions(cutId, cutName) {
  return ai.SUGGESTED_QUESTIONS.map((item) => {
    let question = item.question
    if (item.id === 'best_cooking') {
      question = `这块${cutName}怎么做更好吃？`
    } else if (item.id === 'stew_or_fry') {
      question = `这块${cutName}适合炖还是快炒？`
    } else if (item.id === 'storage') {
      question = `这块${cutName}一次吃不完怎么保存？`
    }

    if (cutId === 'brisket' && item.id === 'doneness') {
      return Object.assign({}, item, {
        label: '炖到什么程度？',
        question: `这块${cutName}炖到什么程度口感更合适？`
      })
    }
    if (item.id === 'doneness') {
      question = `这块${cutName}做牛排或煎制时，几分熟更合适？`
    }
    return Object.assign({}, item, { question })
  })
}

Page({
  data: {
    cutId: '',
    cutName: '牛肉',
    freshness: null,
    hasRecognition: false,
    questions: [],
    messages: [],
    typing: false,
    scrollInto: '',
    policyOpen: false,
    draft: '',
    canSend: false
  },

  onLoad(options) {
    let cutId = options.cutId || ''
    let cutName = safeDecode(options.cutName)
    let freshness = null
    if (!cutId) {
      const pending = storage.getPendingResult()
      const latest = history.readHistory()[0]
      const recognition = pending || latest || null
      cutId = recognition ? recognition.cutId : ''
      cutName = recognition ? recognition.cutName : ''
      freshness = recognition ? recognition.freshness : null
    }

    const hasRecognition = Boolean(cutId && cutName)
    const resolvedCutName = cutName || '牛肉'
    const questions = getQuestions(cutId, resolvedCutName)
    this.setData(
      {
        cutId,
        cutName: resolvedCutName,
        freshness,
        hasRecognition,
        questions,
        messages: [
          {
            id: 'welcome',
            role: 'assistant',
            text: hasRecognition
              ? `我已经锁定这次识别出的${resolvedCutName}。你可以选一个快捷问题，也可以直接输入处理、做法、熟度或保存方面的问题。`
              : '你还没有识别具体部位。现在也可以直接问牛肉相关问题；如果告诉我准备做什么菜，我会给出更通用的建议。',
            time: this.shortTime(),
            disclaimer: ''
          }
        ]
      },
      () => {
        if (options.questionId) {
          const question = questions.find((item) => item.id === options.questionId)
          if (question) this.askQuestion(question)
        }
      }
    )
  },

  shortTime() {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    wx.reLaunch({ url: '/pages/index/index' })
  },

  goDetect() {
    wx.navigateTo({ url: '/pages/detect/detect' })
  },

  updateDraft(event) {
    const draft = event.detail.value || ''
    this.setData({
      draft,
      canSend: Boolean(draft.trim())
    })
  },

  sendCustomQuestion() {
    const question = this.data.draft.trim()
    if (!question || this.data.typing) return
    this.setData({
      draft: '',
      canSend: false
    })
    this.askQuestion({
      id: 'custom',
      question
    })
  },

  pickQuestion(event) {
    const id = event.currentTarget.dataset.id
    const question = this.data.questions.find((item) => item.id === id)
    if (question) this.askQuestion(question)
  },

  async askQuestion(question) {
    if (this.data.typing) return

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: question.question,
      time: this.shortTime()
    }
    const messages = this.data.messages.concat(userMessage)
    this.setData(
      {
        messages,
        typing: true,
        scrollInto: `msg-${userMessage.id}`
      },
      () => this.scrollToBottom()
    )

    try {
      const response = await ai.askBeefAssistant({
        questionId: question.id,
        question: question.question,
        context: {
          cutId: this.data.cutId,
          cutName: this.data.cutName,
          freshness: this.data.freshness
        }
      })
      const answerMessage = {
        id: response.answerId || `ai_${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        time: this.shortTime(),
        disclaimer: response.disclaimer || '',
        blocked: Boolean(response.blocked),
        blockLabel: response.blockLabel || ''
      }
      this.setData(
        {
          messages: this.data.messages.concat(answerMessage),
          typing: false
        },
        () => this.scrollToBottom()
      )
    } catch (error) {
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        text: '这次没有获取到建议，请稍后再试。你仍然可以参考百科中的基础烹饪与保存指南。',
        time: this.shortTime(),
        disclaimer: ''
      }
      this.setData(
        {
          messages: this.data.messages.concat(errorMessage),
          typing: false
        },
        () => this.scrollToBottom()
      )
    }
  },

  scrollToBottom() {
    const messages = this.data.messages
    if (!messages.length) return
    this.setData({
      scrollInto: `msg-${messages[messages.length - 1].id}`
    })
  },

  togglePolicy() {
    this.setData({ policyOpen: !this.data.policyOpen })
  }
})
