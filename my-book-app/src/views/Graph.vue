<template>
  <div>
    <h2>ジャンル別読書データ</h2>
    <canvas id="genreChart"></canvas>
    <h2>月別読書データ</h2>
    <canvas id="monthChart"></canvas>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

export default {
  setup() {
    const router = useRouter();
    const store = useStore();
    const genreData = ref([]);
    const monthData = ref([]);

    const checkTokenAndRedirect = () => {
      store.dispatch('checkToken');
      if (!store.getters.isLoggedIn) {
        router.push('/login');
      }
    };

    const fetchGenreStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/books/genre-stats',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        genreData.value = response.data;
      } catch (error) {
        console.error('Error fetching genre stats:', error);
      }
    };

    const fetchMonthStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/books/month-stats',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        monthData.value = response.data;
      } catch (error) {
        console.error('Error fetching month stats:', error);
      }
    };

    onMounted(async () => {
      checkTokenAndRedirect();
      await fetchGenreStats();
      await fetchMonthStats();

      if (genreData.value.length > 0) {
        new Chart(document.getElementById('genreChart'), {
          type: 'pie',
          data: {
            labels: genreData.value.map((g) => g.genre),
            datasets: [
              {
                data: genreData.value.map((g) => g.count),
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
              },
            ],
          },
        });
      }

      if (monthData.value.length > 0) {
        new Chart(document.getElementById('monthChart'), {
          type: 'bar',
          data: {
            labels: monthData.value.map((m) => m.month),
            datasets: [
              {
                label: 'Books Read',
                data: monthData.value.map((m) => m.count),
                backgroundColor: '#42b983',
              },
            ],
          },
        });
      }
    });

    return { store };
  },
};
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
