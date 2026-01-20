import { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/mealRating.css";
import { Star, Coffee, Utensils, Moon, CheckCircle, AlertCircle, Loader2, Calendar } from "lucide-react";

export default function MealRating() {
    const [breakfast, setBreakfast] = useState(0);
    const [lunch, setLunch] = useState(0);
    const [dinner, setDinner] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [todayMenu, setTodayMenu] = useState({
        breakfast: "Poha, Samosa, Tea/Coffee (8:00-9:00 AM)",
        lunch: "Rice, Dal, Sabzi, Roti, Curd (12:30-1:30 PM)",
        dinner: "Chapati, Vegetables, Dal, Rice, Salad (7:30-8:30 PM)"
    });
    const [previousRatings, setPreviousRatings] = useState([]);

    // Fetch today's menu and previous ratings
    useEffect(() => {
        fetchTodayMenu();
        fetchPreviousRatings();
    }, []);

    const fetchTodayMenu = async () => {
        try {
            // Mock menu data - in real app, this would come from API
            setTodayMenu({
                breakfast: "Poha, Samosa, Tea/Coffee (8:00-9:00 AM)",
                lunch: "Rice, Dal, Sabzi, Roti, Curd (12:30-1:30 PM)",
                dinner: "Chapati, Vegetables, Dal, Rice, Salad (7:30-8:30 PM)"
            });
        } catch (error) {
            console.error("Failed to fetch menu:", error);
        }
    };

    const fetchPreviousRatings = async () => {
        try {
            // Mock previous ratings data
            const mockRatings = [
                { date: '2024-01-15', breakfast: 4, lunch: 5, dinner: 3, average: 4 },
                { date: '2024-01-14', breakfast: 3, lunch: 4, dinner: 4, average: 3.7 },
                { date: '2024-01-13', breakfast: 5, lunch: 3, dinner: 5, average: 4.3 },
                { date: '2024-01-12', breakfast: 4, lunch: 5, dinner: 4, average: 4.3 }
            ];
            setPreviousRatings(mockRatings);
        } catch (error) {
            console.error("Failed to fetch previous ratings:", error);
        }
    };

    const StarRating = ({ value, onChange, label, icon }) => {
        const [hoveredStar, setHoveredStar] = useState(0);
        
        const stars = [1, 2, 3, 4, 5];
        
        return (
            <div className="meal-rating">
                <div className="meal-header">
                    <div className="meal-icon">{icon}</div>
                    <span className="meal-label">{label}</span>
                </div>
                <div className="stars-container">
                    {stars.map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star ${star <= (hoveredStar || value) ? 'active' : ''}`}
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            aria-label={`Rate ${label} ${star} stars`}
                        >
                            <Star size={24} fill={star <= (hoveredStar || value) ? 'currentColor' : 'none'} />
                        </button>
                    ))}
                </div>
                {value > 0 && (
                    <div className="rating-feedback">
                        {value === 1 && "Poor"}
                        {value === 2 && "Fair"}
                        {value === 3 && "Good"}
                        {value === 4 && "Very Good"}
                        {value === 5 && "Excellent"}
                    </div>
                )}
            </div>
        );
    };

    const isFormValid = breakfast > 0 && lunch > 0 && dinner > 0;

    const submitRating = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        
        setIsSubmitting(true);
        setShowError(false);
        
        try {
            await API.post("/ratings/submit", { 
                breakfast, 
                lunch, 
                dinner
            });
            setShowSuccess(true);
            setBreakfast(0);
            setLunch(0);
            setDinner(0);
            
            // Hide success message and show thank you
            setTimeout(() => {
                setShowSuccess(false);
                setShowThankYou(true);
            }, 2000);
            
            // Hide thank you after 5 seconds
            setTimeout(() => setShowThankYou(false), 7000);
        } catch (err) {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rating-container">
            <div className="rating-card">
                <div className="rating-header">
                    <div className="header-icon">
                        <Star size={32} />
                    </div>
                    <div className="header-text">
                        <h2>Daily Meal Rating</h2>
                        <p className="header-subtitle">
                            Help us improve our food quality with your feedback
                        </p>
                    </div>
                </div>

                <div className="menu-section">
                    <div className="menu-header">
                        <Utensils size={20} />
                        <h3>Today's Menu</h3>
                    </div>
                    <div className="menu-content">
                        <div className="menu-item">
                            <div className="meal-time">Breakfast</div>
                            <div className="meal-details">{todayMenu.breakfast}</div>
                        </div>
                        <div className="menu-item">
                            <div className="meal-time">Lunch</div>
                            <div className="meal-details">{todayMenu.lunch}</div>
                        </div>
                        <div className="menu-item">
                            <div className="meal-time">Dinner</div>
                            <div className="meal-details">{todayMenu.dinner}</div>
                        </div>
                    </div>
                </div>

                {showSuccess && (
                    <div className="feedback-message success">
                        <CheckCircle size={20} />
                        <span>Rating submitted successfully!</span>
                    </div>
                )}
                
                {showError && (
                    <div className="feedback-message error">
                        <AlertCircle size={20} />
                        <span>Failed to submit rating. Please try again.</span>
                    </div>
                )}

                {showThankYou && (
                    <div className="thank-you-message">
                        <Star size={24} />
                        <h3>Thank you for your feedback!</h3>
                        <p>Your rating helps us improve our meal quality</p>
                    </div>
                )}

                <form onSubmit={submitRating}>
                    <div className="meals-container">
                        <StarRating
                            value={breakfast}
                            onChange={setBreakfast}
                            label="Breakfast"
                            icon={<Coffee size={24} />}
                        />
                        
                        <StarRating
                            value={lunch}
                            onChange={setLunch}
                            label="Lunch"
                            icon={<Utensils size={24} />}
                        />
                        
                        <StarRating
                            value={dinner}
                            onChange={setDinner}
                            label="Dinner"
                            icon={<Moon size={24} />}
                        />
                    </div>

                    <div className="submit-section">
                        <button 
                            type="submit" 
                            className={`submit-btn ${!isFormValid ? 'disabled' : ''}`}
                            disabled={!isFormValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="spinner" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star size={20} />
                                    Submit Rating
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {previousRatings.length > 0 && (
                    <div className="history-section">
                        <div className="history-header">
                            <Calendar size={20} />
                            <h3>Previous Ratings</h3>
                        </div>
                        <div className="ratings-grid">
                            {previousRatings.map((rating, index) => (
                                <div key={index} className="rating-card">
                                    <div className="rating-date">{rating.date}</div>
                                    <div className="rating-meals">
                                        <div className="mini-rating">
                                            <span className="meal-label">B</span>
                                            <div className="mini-stars">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={12} 
                                                        fill={star <= rating.breakfast ? 'currentColor' : 'none'} 
                                                        className={star <= rating.breakfast ? 'filled' : 'empty'} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mini-rating">
                                            <span className="meal-label">L</span>
                                            <div className="mini-stars">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={12} 
                                                        fill={star <= rating.lunch ? 'currentColor' : 'none'} 
                                                        className={star <= rating.lunch ? 'filled' : 'empty'} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mini-rating">
                                            <span className="meal-label">D</span>
                                            <div className="mini-stars">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star} 
                                                        size={12} 
                                                        fill={star <= rating.dinner ? 'currentColor' : 'none'} 
                                                        className={star <= rating.dinner ? 'filled' : 'empty'} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rating-average">
                                        Average: {rating.average.toFixed(1)} 
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}