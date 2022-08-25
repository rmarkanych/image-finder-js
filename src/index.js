import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
let inputValue = '';
let currentPage = 1;
const lightbox = new SimpleLightbox('.gallery a');

const getData = async inputValue => {
  const options = {
    params: {
      key: '29467934-4572e40f44c288e7a55931bb1',
      q: inputValue,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: currentPage,
    },
  };
  try {
    const r = await axios.get(BASE_URL, options);
    return r.data;
  } catch {
    if (r.status !== 200) Notify.failure('Sorry');
  }
};

const onFormSubmit = async e => {
  e.preventDefault();
  currentPage = 1;
  inputValue = form.elements.searchQuery.value;
  try {
    const r = await getData(inputValue);
    if (r.hits.length > 1) {
      gallery.innerHTML = renderDataByBtn(r.hits);
      Notify.success(`Hooray! We found ${r.totalHits} images.`);
      currentPage++;
      form.reset();
      lightbox.refresh();
      loadBtn.classList.add('load-more-active');
    } else {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadBtn.classList.remove('load-more-active');
      form.reset();
      gallery.innerHTML = '';
    }
  } catch (error) {
    console.log(error.message);
  }
};

const renderDataByBtn = dataImages => {
  return dataImages
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <a class="photo-link" href="${largeImageURL}">
        <div class="photo-card">
         <img src="${webformatURL}" alt="${tags}" loading="lazy" />
         <div class="info">
    <div class="info-item">
      <b>Likes</b><br>
      <p>${likes}</p>
    </div>
    <div class="info-item">
       <b>Views</b><br>
       <p>${views}</p>
    </div>
    <div class="info-item">
      <b>Comments</b><br>
      <p>${comments}</p>
    </div>
    <div class="info-item">
      <b>Downloads</b><br>
       <p>${downloads}</p>
    </div>
  </div>
</div>
 </a>`;
      }
    )
    .join('');
};

const loadDataByBtn = async () => {
  try {
    const r = await getData(inputValue);
    gallery.innerHTML += renderDataByBtn(r.hits);
    currentPage++;
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    if (r.hits.length === 0)
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
  } catch (error) {
    console.log(error.message);
  }
};

form.addEventListener('submit', onFormSubmit);
loadBtn.addEventListener('click', loadDataByBtn);
