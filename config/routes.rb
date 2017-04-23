Rails.application.routes.draw do
  root "static_pages#show"

  get "sign_in", to: "sessions#new"
  post "sign_in", to: "sessions#create"
  delete "log_out", to: "sessions#destroy"

  resources :users, only: [:new, :create, :show],
    path_names: {new: "sign_up"}
end
