// plugins/daily.ts
export default defineNuxtPlugin(() => {
  const { quote, author: quoteAuthor, loading: quoteLoading, error: quoteError } = useDailyQuote()
  const { imageUrl, author: natureAuthor, authorLink, loading: natureLoading, error: natureError } = useDailyNature()

  return {
    provide: {
      dailyQuote: {
        quote:   computed(() => quote.value),
        author:  computed(() => quoteAuthor.value),
        loading: computed(() => quoteLoading.value),
        error:   computed(() => quoteError.value),
      },
      dailyNature: {
        imageUrl:   computed(() => imageUrl.value),
        author:     computed(() => natureAuthor.value),
        authorLink: computed(() => authorLink.value),
        loading:    computed(() => natureLoading.value),
        error:      computed(() => natureError.value),
      },
    },
  }
})